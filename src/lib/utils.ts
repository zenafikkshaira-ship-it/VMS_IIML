import { randomInt } from "crypto";
import { prisma } from "./db";

export function generateVisitCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "VMS-";
  for (let i = 0; i < 6; i++) {
    code += chars[randomInt(chars.length)];
  }
  return code;
}

export function generateOtp(): string {
  return String(randomInt(100000, 999999));
}

export async function createOtpSession(phone: string): Promise<string> {
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.otpSession.create({
    data: { phone, code, expiresAt },
  });

  return code;
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const session = await prisma.otpSession.findFirst({
    where: {
      phone,
      code,
      verified: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!session) return false;

  await prisma.otpSession.update({
    where: { id: session.id },
    data: { verified: true },
  });

  return true;
}

export function maskIdNumber(idNumber: string): string {
  if (idNumber.length <= 4) return "****";
  return "*".repeat(idNumber.length - 4) + idNumber.slice(-4);
}
