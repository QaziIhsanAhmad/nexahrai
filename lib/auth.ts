import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "nexahrai-secret"
);

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  companyId: string | null;
  name: string;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function signToken(payload: JWTPayload) {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("nexahrai_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireRole(
  allowedRoles: string[]
): Promise<JWTPayload> {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.role)) {
    throw new Error("Forbidden");
  }
  return session;
}

export async function createSession(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { company: true },
  });
  if (!user) throw new Error("User not found");

  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    companyId: user.companyId,
    name: user.name,
  };

  const token = await signToken(payload);

  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });

  return { token, user: payload };
}

export const ROLE_HIERARCHY = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  HR_MANAGER: 3,
  MANAGER: 2,
  EMPLOYEE: 1,
} as const;

export function hasPermission(userRole: string, requiredRole: string) {
  const userLevel = ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole as keyof typeof ROLE_HIERARCHY] ?? 0;
  return userLevel >= requiredLevel;
}
