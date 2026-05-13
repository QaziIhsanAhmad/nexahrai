import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session.companyId) return NextResponse.json([]);

    const shifts = await prisma.shift.findMany({
      where: { companyId: session.companyId, isActive: true },
      include: { _count: { select: { assignments: true } } },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(shifts);
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
    const shift = await prisma.shift.create({
      data: {
        ...body,
        companyId: session.companyId,
        workingDays: body.workingDays || [],
        isActive: true,
      },
    });

    return NextResponse.json(shift, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create shift" }, { status: 500 });
  }
}
