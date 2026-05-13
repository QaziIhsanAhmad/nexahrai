import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "nexahrai-secret"
);

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/complete-registration",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/request-verification",
  "/api/webhooks",
  "/_next",
  "/favicon.ico",
];

const ROLE_PATHS: Record<string, string[]> = {
  "/dashboard/recruitment": ["SUPER_ADMIN", "ADMIN", "HR_MANAGER"],
  "/dashboard/payroll": ["SUPER_ADMIN", "ADMIN", "HR_MANAGER"],
  "/dashboard/analytics": ["SUPER_ADMIN", "ADMIN", "HR_MANAGER", "MANAGER"],
  "/dashboard/settings": ["SUPER_ADMIN", "ADMIN"],
  "/dashboard/companies": ["SUPER_ADMIN"],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("nexahrai_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const role = payload.role as string;

    for (const [path, roles] of Object.entries(ROLE_PATHS)) {
      if (pathname.startsWith(path) && !roles.includes(role)) {
        return NextResponse.redirect(new URL("/dashboard?error=forbidden", request.url));
      }
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId as string);
    requestHeaders.set("x-user-role", role);
    requestHeaders.set("x-company-id", (payload.companyId as string) || "");

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("nexahrai_token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
