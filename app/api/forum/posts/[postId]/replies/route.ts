import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/forum/posts/[postId]/replies
export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Reply content is required." }, { status: 400 });
  }

  const post = await prisma.forumPost.findUnique({
    where: { id: params.postId },
    select: { id: true },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const reply = await prisma.forumReply.create({
    data: {
      content: content.trim(),
      postId: params.postId,
      authorId: user.id,
      authorName: user.name || session.user.email,
    },
  });

  return NextResponse.json(reply, { status: 201 });
}
