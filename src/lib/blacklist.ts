import { IdDocumentType } from "@prisma/client";
import { prisma } from "./db";

interface BlacklistCheckInput {
  name: string;
  phone?: string;
  idDocumentType?: IdDocumentType;
  idDocumentNumber?: string;
}

export async function checkBlacklist(input: BlacklistCheckInput) {
  const conditions = [];

  if (input.phone) {
    conditions.push({ phone: input.phone, isActive: true });
  }

  if (input.idDocumentNumber) {
    conditions.push({
      idDocumentNumber: input.idDocumentNumber,
      isActive: true,
    });
  }

  if (input.name) {
    conditions.push({
      name: { equals: input.name, mode: "insensitive" as const },
      isActive: true,
    });
  }

  if (conditions.length === 0) return null;

  return prisma.blacklist.findFirst({
    where: { OR: conditions },
  });
}
