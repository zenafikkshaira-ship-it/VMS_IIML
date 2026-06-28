import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    await requireSession([UserRole.ADMIN, UserRole.IT_ADMIN, UserRole.AUDIT]);

    const entries = await prisma.blacklist.findMany({
      where: { isActive: true },
      include: { addedBy: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ entries });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch blacklist" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession([UserRole.ADMIN, UserRole.IT_ADMIN]);
    const body = await request.json();
    const { name, idDocumentType, idDocumentNumber, phone, reason } = body;

    if (!name || !reason) {
      return NextResponse.json({ error: "Name and reason required" }, { status: 400 });
    }

    const entry = await prisma.blacklist.create({
      data: {
        name,
        idDocumentType,
        idDocumentNumber,
        phone,
        reason,
        addedById: session.id,
      },
    });

    await logAudit({
      action: "BLACKLIST_ADDED",
      entityType: "Blacklist",
      entityId: entry.id,
      userId: session.id,
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to add to blacklist" }, { status: 500 });
  }
}
