import { NextRequest, NextResponse } from "next/server";
import { UserRole, VisitStatus } from "@prisma/client";
import { addMinutes } from "date-fns";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession([UserRole.SECURITY_GUARD, UserRole.ADMIN, UserRole.IT_ADMIN]);
    const body = await request.json();
    const { visitCode, visitId } = body;

    const visit = visitId
      ? await prisma.visit.findUnique({ where: { id: visitId } })
      : await prisma.visit.findUnique({ where: { visitCode } });

    if (!visit) {
      return NextResponse.json({ error: "Visit not found" }, { status: 404 });
    }

    if (visit.status === VisitStatus.CHECKED_IN) {
      return NextResponse.json({ error: "Already checked in" }, { status: 400 });
    }

    if (
      visit.status !== VisitStatus.APPROVED &&
      visit.status !== VisitStatus.INVITED
    ) {
      return NextResponse.json(
        { error: `Cannot check in. Status: ${visit.status}` },
        { status: 400 }
      );
    }

    const now = new Date();
    const updated = await prisma.visit.update({
      where: { id: visit.id },
      data: {
        status: VisitStatus.CHECKED_IN,
        checkedInAt: now,
        checkedInById: session.id,
        validFrom: now,
        validUntil: addMinutes(now, visit.durationMinutes),
      },
      include: {
        host: { select: { name: true, department: true } },
      },
    });

    await logAudit({
      action: "CHECK_IN",
      entityType: "Visit",
      entityId: visit.id,
      userId: session.id,
    });

    return NextResponse.json({ visit: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Check-in failed" }, { status: 500 });
  }
}
