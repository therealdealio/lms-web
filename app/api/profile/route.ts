import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_IMAGE_BYTES = 20 * 1024; // 20 KB

// GET /api/profile
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, email: true, avatarEmoji: true, avatarImage: true },
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

  const { name, avatarEmoji, avatarImage } = await req.json();

  if (name !== undefined) {
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 30) {
      return NextResponse.json(
        { error: "Username must be between 2 and 30 characters." },
        { status: 400 }
      );
    }
  }

  if (avatarImage !== undefined && avatarImage !== null) {
    // Validate it's a base64 data URL image
    if (!avatarImage.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid image format." }, { status: 400 });
    }
    // Check decoded size (~3/4 of base64 string length)
    const base64Data = avatarImage.split(",")[1] ?? "";
    const byteSize = Math.ceil((base64Data.length * 3) / 4);
    if (byteSize > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Image must be 20 KB or smaller." },
        { status: 400 }
      );
    }
  }

  const user = await prisma.user.update({
    where: { email: session.user.email },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(avatarEmoji !== undefined && { avatarEmoji: avatarEmoji || null }),
      ...(avatarImage !== undefined && { avatarImage: avatarImage || null }),
    },
    select: { id: true, name: true, email: true, avatarEmoji: true, avatarImage: true },
  });

  // Sync updated name and emoji to all existing forum posts and replies
  const postData: Record<string, string | null> = {};
  const replyData: Record<string, string | null> = {};
  if (name !== undefined) {
    postData.authorName = name.trim();
    replyData.authorName = name.trim();
  }
  if (avatarEmoji !== undefined) {
    postData.authorAvatarEmoji = avatarEmoji || null;
    replyData.authorAvatarEmoji = avatarEmoji || null;
  }
  if (Object.keys(postData).length > 0) {
    await Promise.all([
      prisma.forumPost.updateMany({ where: { authorId: user.id }, data: postData }),
      prisma.forumReply.updateMany({ where: { authorId: user.id }, data: replyData }),
    ]);
  }

  return NextResponse.json(user);
}
