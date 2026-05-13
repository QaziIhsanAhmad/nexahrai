import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session.companyId) return NextResponse.json([]);

    const reviews = await prisma.performanceReview.findMany({
      where: { companyId: session.companyId },
      include: {
        reviewee: { include: { position: { select: { title: true } } } },
        reviewer: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!["SUPER_ADMIN", "ADMIN", "HR_MANAGER", "MANAGER"].includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!session.companyId) return NextResponse.json({ error: "No company" }, { status: 400 });

    const body = await request.json();
    const review = await prisma.performanceReview.create({
      data: {
        companyId: session.companyId,
        revieweeId: body.revieweeId,
        reviewerId: body.reviewerId || session.userId,
        period: body.period,
        year: body.year || new Date().getFullYear(),
        type: body.type || "ANNUAL",
        goals: body.goals,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
