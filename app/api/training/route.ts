import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session.companyId) return NextResponse.json([]);

    const courses = await prisma.course.findMany({
      where: { companyId: session.companyId },
      include: { _count: { select: { enrollments: true, modules: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(courses);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!["SUPER_ADMIN", "ADMIN", "HR_MANAGER"].includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!session.companyId) return NextResponse.json({ error: "No company" }, { status: 400 });

    const body = await request.json();
    const course = await prisma.course.create({
      data: {
        ...body,
        companyId: session.companyId,
        createdById: session.userId,
        status: "DRAFT",
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}
