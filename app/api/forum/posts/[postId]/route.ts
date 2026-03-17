import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = "rrthai88@gmail.com";

// GET /api/forum/posts/[postId]
export async function GET(
  _req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const post = await prisma.forumPost.findUnique({
    where: { id: params.postId },
    include: {
      replies: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  return NextResponse.json(post);
}

// DELETE /api/forum/posts/[postId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const post = await prisma.forumPost.findUnique({
    where: { id: params.postId },
    select: { authorId: true },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  const isAdmin = session.user.email === ADMIN_EMAIL;
  const isAuthor = user?.id === post.authorId;

  if (!isAdmin && !isAuthor) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.forumPost.delete({ where: { id: params.postId } });

  return NextResponse.json({ success: true });
}
