import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = "rrthai88@gmail.com";

// GET /api/forum/posts/[postId]
export async function GET(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const session = await getServerSession(authOptions);
  let currentUserId: string | null = null;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    currentUserId = user?.id ?? null;
  }

  const post = await prisma.forumPost.findUnique({
    where: { id: params.postId },
    include: {
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          _count: { select: { likes: true } },
          likes: currentUserId
            ? { where: { userId: currentUserId }, select: { id: true } }
            : false,
        },
      },
      _count: { select: { likes: true } },
      likes: currentUserId
        ? { where: { userId: currentUserId }, select: { id: true } }
        : false,
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  // Look up live avatarImage for all unique authors (post + replies)
  const authorIds = [...new Set([post.authorId, ...post.replies.map((r) => r.authorId)])];
  const authors = await prisma.user.findMany({
    where: { id: { in: authorIds } },
    select: { id: true, avatarImage: true },
  });
  const imageMap = Object.fromEntries(authors.map((a) => [a.id, a.avatarImage]));

  return NextResponse.json({
    ...post,
    authorAvatarImage: imageMap[post.authorId] ?? null,
    likedByMe: Array.isArray(post.likes) && post.likes.length > 0,
    likes: undefined,
    replies: post.replies.map((r) => ({
      ...r,
      authorAvatarImage: imageMap[r.authorId] ?? null,
      likedByMe: Array.isArray(r.likes) && r.likes.length > 0,
      likes: undefined,
    })),
  });
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
