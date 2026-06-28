import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function GET() {
  try {
    await requireSession([
      UserRole.SECURITY_GUARD,
      UserRole.ADMIN,
      UserRole.IT_ADMIN,
      UserRole.HOST,
    ]);

    const hosts = await prisma.user.findMany({
      where: { role: UserRole.HOST, isActive: true },
      select: { id: true, name: true, department: true, email: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ hosts });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch hosts" }, { status: 500 });
  }
}
