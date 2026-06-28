import { NextRequest, NextResponse } from "next/server";
import { UserRole, VisitStatus, VisitType } from "@prisma/client";
import { addMinutes } from "date-fns";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { checkBlacklist } from "@/lib/blacklist";
import { notifyHostOfArrival } from "@/lib/notifications";
import { generateVisitCode, maskIdNumber } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      visitorName,
      visitorPhone,
      organization,
      purpose,
      hostId,
      idDocumentType,
      idDocumentNumber,
      durationMinutes = 120,
    } = body;

    if (!visitorName || !visitorPhone || !purpose || !hostId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const blacklistMatch = await checkBlacklist({
      name: visitorName,
      phone: visitorPhone,
      idDocumentType,
      idDocumentNumber,
    });

    if (blacklistMatch) {
      await logAudit({
        action: "BLACKLIST_MATCH",
        entityType: "Blacklist",
        entityId: blacklistMatch.id,
        metadata: { visitorName, visitorPhone },
      });

      return NextResponse.json(
        { error: "BLACKLIST_MATCH", reason: blacklistMatch.reason },
        { status: 403 }
      );
    }

    const visitCode = generateVisitCode();
    const now = new Date();

    const visit = await prisma.visit.create({
      data: {
        visitCode,
        visitorName,
        visitorPhone,
        organization,
        purpose,
        visitType: VisitType.WALK_IN,
        status: VisitStatus.PENDING_APPROVAL,
        expectedAt: now,
        durationMinutes,
        hostId,
        idDocumentType,
        idDocumentNumber,
        idDocumentLast4: idDocumentNumber ? maskIdNumber(idDocumentNumber) : null,
        validFrom: now,
        validUntil: addMinutes(now, durationMinutes),
      },
      include: {
        host: { select: { name: true, phone: true, email: true } },
      },
    });

    await notifyHostOfArrival(visit);

    await logAudit({
      action: "VISIT_CREATED",
      entityType: "Visit",
      entityId: visit.id,
      metadata: { visitType: "WALK_IN" },
    });

    return NextResponse.json({ visit }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Walk-in registration failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await requireSession([UserRole.SECURITY_GUARD, UserRole.ADMIN, UserRole.IT_ADMIN]);

    const pending = await prisma.visit.findMany({
      where: { status: VisitStatus.PENDING_APPROVAL },
      include: {
        host: { select: { name: true, department: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ visits: pending });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch pending visits" }, { status: 500 });
  }
}
