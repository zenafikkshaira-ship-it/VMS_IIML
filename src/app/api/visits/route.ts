import { NextRequest, NextResponse } from "next/server";
import { UserRole, VisitStatus, VisitType } from "@prisma/client";
import { addHours } from "date-fns";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { checkBlacklist } from "@/lib/blacklist";
import { notifyVisitorInvite } from "@/lib/notifications";
import { generateVisitCode } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession([
      UserRole.HOST,
      UserRole.ADMIN,
      UserRole.IT_ADMIN,
      UserRole.SECURITY_GUARD,
      UserRole.AUDIT,
    ]);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as VisitStatus | null;
    const scope = searchParams.get("scope");

    const where =
      scope === "mine" || session.role === UserRole.HOST
        ? { hostId: session.id }
        : {};

    const visits = await prisma.visit.findMany({
      where: {
        ...where,
        ...(status ? { status } : {}),
      },
      include: {
        host: { select: { id: true, name: true, department: true, email: true } },
      },
      orderBy: { expectedAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ visits });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch visits" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession([UserRole.HOST, UserRole.ADMIN, UserRole.IT_ADMIN]);
    const body = await request.json();

    const {
      visitorName,
      visitorPhone,
      visitorEmail,
      organization,
      purpose,
      expectedAt,
      durationMinutes = 120,
      escortRequired = false,
    } = body;

    if (!visitorName || !visitorPhone || !purpose || !expectedAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const blacklistMatch = await checkBlacklist({
      name: visitorName,
      phone: visitorPhone,
    });

    if (blacklistMatch) {
      return NextResponse.json(
        { error: "Visitor matches blacklist. Contact admin." },
        { status: 403 }
      );
    }

    const visitCode = generateVisitCode();
    const expectedDate = new Date(expectedAt);

    const visit = await prisma.visit.create({
      data: {
        visitCode,
        visitorName,
        visitorPhone,
        visitorEmail,
        organization,
        purpose,
        visitType: VisitType.PRE_REGISTERED,
        status: VisitStatus.INVITED,
        expectedAt: expectedDate,
        durationMinutes,
        escortRequired,
        hostId: session.id,
        createdById: session.id,
        validFrom: expectedDate,
        validUntil: addHours(expectedDate, Math.ceil(durationMinutes / 60) + 1),
      },
      include: {
        host: { select: { name: true, department: true } },
      },
    });

    await notifyVisitorInvite(visit);

    await logAudit({
      action: "VISIT_CREATED",
      entityType: "Visit",
      entityId: visit.id,
      userId: session.id,
      metadata: { visitType: "PRE_REGISTERED" },
    });

    return NextResponse.json({ visit }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create visit" }, { status: 500 });
  }
}
