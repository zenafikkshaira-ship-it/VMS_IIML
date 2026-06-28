import { NextRequest, NextResponse } from "next/server";
import { UserRole, VisitStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession([UserRole.HOST, UserRole.ADMIN, UserRole.IT_ADMIN]);
    const { id } = await params;
    const body = await request.json();
    const { action, rejectionReason } = body;

    const visit = await prisma.visit.findUnique({ where: { id } });

    if (!visit) {
      return NextResponse.json({ error: "Visit not found" }, { status: 404 });
    }

    if (session.role === UserRole.HOST && visit.hostId !== session.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (action === "approve") {
      const updated = await prisma.visit.update({
        where: { id },
        data: { status: VisitStatus.APPROVED },
      });

      await logAudit({
        action: "VISIT_APPROVED",
        entityType: "Visit",
        entityId: id,
        userId: session.id,
      });

      return NextResponse.json({ visit: updated });
    }

    if (action === "reject") {
      const updated = await prisma.visit.update({
        where: { id },
        data: {
          status: VisitStatus.REJECTED,
          rejectionReason: rejectionReason ?? "Rejected by host",
        },
      });

      await logAudit({
        action: "VISIT_REJECTED",
        entityType: "Visit",
        entityId: id,
        userId: session.id,
      });

      return NextResponse.json({ visit: updated });
    }

    if (action === "cancel") {
      const updated = await prisma.visit.update({
        where: { id },
        data: { status: VisitStatus.CANCELLED },
      });

      await logAudit({
        action: "VISIT_CANCELLED",
        entityType: "Visit",
        entityId: id,
        userId: session.id,
      });

      return NextResponse.json({ visit: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update visit" }, { status: 500 });
  }
}
