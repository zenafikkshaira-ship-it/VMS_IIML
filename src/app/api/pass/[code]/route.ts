import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const visit = await prisma.visit.findUnique({
      where: { visitCode: code },
      include: {
        host: { select: { name: true, department: true } },
      },
    });

    if (!visit) {
      return NextResponse.json({ error: "Pass not found" }, { status: 404 });
    }

    return NextResponse.json({ visit });
  } catch {
    return NextResponse.json({ error: "Failed to fetch pass" }, { status: 500 });
  }
}
