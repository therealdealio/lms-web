import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/forum/posts?category=general&page=1
export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") || "general";
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1"));
  const take = 25;
  const skip = (page - 1) * take;

  const session = await getServerSession(authOptions);
  let currentUserId: string | null = null;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    currentUserId = user?.id ?? null;
  }

  const [posts, total] = await Promise.all([
    prisma.forumPost.findMany({
      where: { category },
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        _count: { select: { replies: true, likes: true } },
        likes: currentUserId
          ? { where: { userId: currentUserId }, select: { id: true } }
          : false,
      },
    }),
    prisma.forumPost.count({ where: { category } }),
  ]);

  const result = posts.map((p) => ({
    ...p,
    likedByMe: Array.isArray(p.likes) && p.likes.length > 0,
    likes: undefined,
  }));

  return NextResponse.json({ posts: result, total, page, pageSize: take });
}

// POST /api/forum/posts
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, content, category } = await req.json();

  if (!title?.trim() || !content?.trim() || !category) {
    return NextResponse.json({ error: "Title, content, and category are required." }, { status: 400 });
  }

  if (title.trim().length > 200) {
    return NextResponse.json({ error: "Title must be 200 characters or less." }, { status: 400 });
  }

  if (content.trim().length > 10000) {
    return NextResponse.json({ error: "Post content must be 10,000 characters or less." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, avatarEmoji: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const post = await prisma.forumPost.create({
    data: {
      title: title.trim(),
      content: content.trim(),
      category,
      authorId: user.id,
      authorName: user.name || session.user.email,
      authorAvatarEmoji: user.avatarEmoji ?? null,
    },
  });

  return NextResponse.json(post, { status: 201 });
}
