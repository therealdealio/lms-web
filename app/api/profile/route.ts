import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/profile
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, email: true, avatarEmoji: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json(user);
}

// PUT /api/profile
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, avatarEmoji } = await req.json();

  if (name !== undefined) {
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 30) {
      return NextResponse.json(
        { error: "Username must be between 2 and 30 characters." },
        { status: 400 }
      );
    }
  }

  const user = await prisma.user.update({
    where: { email: session.user.email },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(avatarEmoji !== undefined && { avatarEmoji: avatarEmoji || null }),
    },
    select: { id: true, name: true, email: true, avatarEmoji: true },
  });

  return NextResponse.json(user);
}
