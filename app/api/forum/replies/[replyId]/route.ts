import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = "rrthai88@gmail.com";

// DELETE /api/forum/replies/[replyId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { replyId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reply = await prisma.forumReply.findUnique({
    where: { id: params.replyId },
    select: { authorId: true },
  });

  if (!reply) {
    return NextResponse.json({ error: "Reply not found." }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  const isAdmin = session.user.email === ADMIN_EMAIL;
  const isAuthor = user?.id === reply.authorId;

  if (!isAdmin && !isAuthor) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.forumReply.delete({ where: { id: params.replyId } });

  return NextResponse.json({ success: true });
}
