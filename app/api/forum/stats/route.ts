import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/forum/stats — returns post counts per category in a single query
export async function GET() {
  const counts = await prisma.forumPost.groupBy({
    by: ["category"],
    _count: { id: true },
    _max: { createdAt: true },
  });

  const stats: Record<string, { postCount: number; latestAt: string | null }> = {};
  for (const row of counts) {
    stats[row.category] = {
      postCount: row._count.id,
      latestAt: row._max.createdAt?.toISOString() ?? null,
    };
  }

  return NextResponse.json(stats);
}
