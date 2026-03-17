import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/forum/replies/[replyId]/like  — toggles like
export async function POST(
  _req: NextRequest,
  { params }: { params: { replyId: string } }
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

  const existing = await prisma.forumReplyLike.findUnique({
    where: { replyId_userId: { replyId: params.replyId, userId: user.id } },
  });

  if (existing) {
    await prisma.forumReplyLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.forumReplyLike.create({
      data: { replyId: params.replyId, userId: user.id },
    });
  }

  const count = await prisma.forumReplyLike.count({ where: { replyId: params.replyId } });

  return NextResponse.json({ liked: !existing, count });
}
