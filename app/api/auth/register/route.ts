import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";
import { slugify, generateEmployeeId } from "@/lib/utils";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "nexahrai-secret"
);

export async function POST(request: NextRequest) {
  try {
    const { token, companyName, companyEmail, name, password } = await request.json();

    if (!token || !companyName || !companyEmail || !name || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    // Verify the email verification token
    let email: string;
    try {
      const { payload } = await jwtVerify(token, SECRET);
      if (payload.purpose !== "registration") throw new Error("Invalid token purpose");
      email = payload.email as string;
    } catch {
      return NextResponse.json({ error: "Verification link is invalid or expired. Please request a new one." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    const slug = slugify(companyName);
    let finalSlug = slug;
    let counter = 1;
    while (await prisma.company.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter++}`;
    }

    const hashed = await hashPassword(password);

    const company = await prisma.company.create({
      data: {
        name: companyName,
        slug: finalSlug,
        email: companyEmail,
      },
    });

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        role: "ADMIN",
        companyId: company.id,
      },
    });

    await prisma.employee.create({
      data: {
        employeeId: generateEmployeeId("ADM"),
        userId: user.id,
        companyId: company.id,
        firstName: name.split(" ")[0] || name,
        lastName: name.split(" ").slice(1).join(" ") || "",
        joinDate: new Date(),
        workEmail: email,
      },
    });

    const { token: sessionToken, user: sessionUser } = await createSession(user.id);

    const cookieStore = await cookies();
    cookieStore.set("nexahrai_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({ user: sessionUser, company }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
