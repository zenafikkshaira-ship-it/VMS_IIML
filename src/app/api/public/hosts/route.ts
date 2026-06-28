import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function GET() {
  const hosts = await prisma.user.findMany({
    where: { role: UserRole.HOST, isActive: true },
    select: { id: true, name: true, department: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ hosts });
}
