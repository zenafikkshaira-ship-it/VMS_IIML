import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { UserRole } from "@prisma/client";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-in-production"
);

export const SESSION_COOKIE = "vms_session";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string | null;
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.user as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireSession(
  allowedRoles?: UserRole[]
): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export function roleDashboardPath(role: UserRole): string {
  switch (role) {
    case UserRole.SECURITY_GUARD:
      return "/guard";
    case UserRole.HOST:
      return "/host";
    case UserRole.ADMIN:
    case UserRole.IT_ADMIN:
      return "/admin";
    case UserRole.AUDIT:
      return "/audit";
    default:
      return "/";
  }
}
