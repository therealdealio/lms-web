import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = "rrthai88@gmail.com";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const startDate = thirtyDaysAgo.toISOString().slice(0, 10);

  // Generate all 30 date strings for filling gaps
  const dates: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  const [totalVisitsAgg, visitRows, totalPrompts, promptLogs, signups] = await Promise.all([
    prisma.pageView.aggregate({ _sum: { count: true } }),
    prisma.pageView.findMany({ where: { date: { gte: startDate } }, orderBy: { date: "asc" } }),
    prisma.promptLog.count(),
    prisma.promptLog.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    }),
  ]);

  // Group prompt logs by date
  const promptsByDate: Record<string, number> = {};
  for (const log of promptLogs) {
    const d = log.createdAt.toISOString().slice(0, 10);
    promptsByDate[d] = (promptsByDate[d] ?? 0) + 1;
  }

  // Group signups by date
  const signupsByDate: Record<string, number> = {};
  for (const u of signups) {
    const d = u.createdAt.toISOString().slice(0, 10);
    signupsByDate[d] = (signupsByDate[d] ?? 0) + 1;
  }

  // Visit rows indexed by date
  const visitsByDate: Record<string, number> = {};
  for (const row of visitRows) visitsByDate[row.date] = row.count;

  // Build 30-day series
  const series = dates.map((date) => ({
    date,
    visits: visitsByDate[date] ?? 0,
    prompts: promptsByDate[date] ?? 0,
    signups: signupsByDate[date] ?? 0,
  }));

  return NextResponse.json({
    totals: {
      visits: totalVisitsAgg._sum.count ?? 0,
      prompts: totalPrompts,
      signups30d: signups.length,
    },
    series,
  });
}
