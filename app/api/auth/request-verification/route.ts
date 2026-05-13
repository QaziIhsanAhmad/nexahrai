import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";
import { sendEmail, verificationEmailHtml } from "@/lib/email";

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "nexahrai-secret"
);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    // Sign a short-lived token containing the email
    const token = await new SignJWT({ email, purpose: "registration" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(SECRET);

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verifyUrl = `${baseUrl}/complete-registration?token=${token}`;

    const result = await sendEmail({
      to: email,
      subject: "Verify your email — NexaHR AI",
      html: verificationEmailHtml({ email, verifyUrl }),
    });

    if (!result.success) {
      console.error("Email send failed:", result.error);
      return NextResponse.json({ error: "Failed to send verification email. Please check your email address and try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verification request error:", error);
    return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 });
  }
}
