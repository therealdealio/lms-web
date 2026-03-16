import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = "rrthai88@gmail.com";

// Update membership tier and/or domain progress for a user
export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = params;
  const body = await req.json();

  // Update membership
  if (body.membership !== undefined) {
    const { tier, promptsUsed } = body.membership;
    await prisma.membership.upsert({
      where: { userId },
      update: {
        ...(tier !== undefined && { tier }),
        ...(promptsUsed !== undefined && { promptsUsed }),
        ...(tier === "pro" && { upgradedAt: new Date() }),
      },
      create: {
        userId,
        tier: tier ?? "free",
        promptsUsed: promptsUsed ?? 0,
        upgradedAt: tier === "pro" ? new Date() : null,
      },
    });
  }

  // Update domain progress
  if (body.domain !== undefined) {
    const { domainId, completed, examScore } = body.domain;
    await prisma.userDomainProgress.upsert({
      where: { userId_domainId: { userId, domainId } },
      update: {
        completed,
        ...(examScore !== undefined && { examScore }),
      },
      create: {
        userId,
        domainId,
        completed,
        examScore: examScore ?? null,
        examAttempts: completed ? 1 : 0,
      },
    });
  }

  // Return updated user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { membership: true, domainProgress: true },
  });

  return NextResponse.json(user);
}
