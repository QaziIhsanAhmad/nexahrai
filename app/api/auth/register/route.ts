import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";
import { slugify, generateEmployeeId } from "@/lib/utils";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { companyName, companyEmail, name, email, password } = await request.json();

    if (!companyName || !companyEmail || !name || !email || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
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

    // Create employee record for admin
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

    const { token, user: sessionUser } = await createSession(user.id);

    const cookieStore = await cookies();
    cookieStore.set("nexahrai_token", token, {
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
