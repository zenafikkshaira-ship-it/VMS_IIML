import { NextResponse } from "next/server";
import { VisitStatus } from "@prisma/client";
import { startOfDay, endOfDay } from "date-fns";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { isVisitOverstay } from "@/lib/visits";

export async function GET() {
  try {
    await requireSession([
      UserRole.SECURITY_GUARD,
      UserRole.ADMIN,
      UserRole.IT_ADMIN,
      UserRole.AUDIT,
    ]);

    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const [onCampus, todayVisits, pendingApprovals, deniedToday] = await Promise.all([
      prisma.visit.findMany({
        where: { status: VisitStatus.CHECKED_IN },
        include: {
          host: { select: { name: true, department: true } },
        },
        orderBy: { checkedInAt: "desc" },
      }),
      prisma.visit.count({
        where: {
          checkedInAt: { gte: todayStart, lte: todayEnd },
        },
      }),
      prisma.visit.count({
        where: { status: VisitStatus.PENDING_APPROVAL },
      }),
      prisma.visit.count({
        where: {
          status: { in: [VisitStatus.DENIED, VisitStatus.REJECTED] },
          updatedAt: { gte: todayStart, lte: todayEnd },
        },
      }),
    ]);

    const overstays = onCampus.filter((v) => isVisitOverstay(v));

    return NextResponse.json({
      onCampus,
      summary: {
        onCampusCount: onCampus.length,
        todayEntries: todayVisits,
        pendingApprovals,
        deniedToday,
        overstayCount: overstays.length,
      },
      overstays,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Dashboard fetch failed" }, { status: 500 });
  }
}
