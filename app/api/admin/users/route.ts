import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, assertAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const denied = assertAdmin(session);
  if (denied) return denied;

  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1"));
  const take = 50;
  const skip = (page - 1) * take;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      include: { membership: true, domainProgress: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.user.count(),
  ]);

  return NextResponse.json({ users, total, page, pageSize: take });
}
