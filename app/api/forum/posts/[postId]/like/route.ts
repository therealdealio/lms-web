import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/forum/posts/[postId]/like  — toggles like
export async function POST(
  _req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const existing = await prisma.forumLike.findUnique({
    where: { postId_userId: { postId: params.postId, userId: user.id } },
  });

  if (existing) {
    await prisma.forumLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.forumLike.create({
      data: { postId: params.postId, userId: user.id },
    });
  }

  const count = await prisma.forumLike.count({ where: { postId: params.postId } });

  return NextResponse.json({ liked: !existing, count });
}
