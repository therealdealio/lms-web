import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { membership: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const membership = user.membership ?? {
    tier: "free",
    promptsUsed: 0,
    licenseKey: null,
    upgradedAt: null,
  };

  return NextResponse.json(membership);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  // Support both flat body and { membership: {...} } wrapper
  const data = body.membership ?? body;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const membership = await prisma.membership.upsert({
    where: { userId: user.id },
    update: {
      tier: data.tier ?? undefined,
      promptsUsed: data.promptsUsed ?? undefined,
      promptLimit: data.promptLimit ?? undefined,
      licenseKey: data.licenseKey ?? undefined,
      upgradedAt: data.upgradedAt ? new Date(data.upgradedAt) : undefined,
    },
    create: {
      userId: user.id,
      tier: data.tier ?? "free",
      promptsUsed: data.promptsUsed ?? 0,
      promptLimit: data.promptLimit ?? 15,
      licenseKey: data.licenseKey ?? null,
      upgradedAt: data.upgradedAt ? new Date(data.upgradedAt) : null,
    },
  });

  return NextResponse.json(membership);
}
