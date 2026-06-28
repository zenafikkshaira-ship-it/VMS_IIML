import { AuditAction, Prisma } from "@prisma/client";
import { prisma } from "./db";

export async function logAudit(params: {
  action: AuditAction;
  entityType: string;
  entityId: string;
  userId?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.auditLog.create({
    data: {
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      userId: params.userId,
      metadata: params.metadata ?? {},
    },
  });
}
