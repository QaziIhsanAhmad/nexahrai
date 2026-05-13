import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const employee = await prisma.employee.findFirst({
      where: { id, companyId: session.companyId ?? undefined },
      include: {
        user: { select: { email: true, avatar: true, role: true } },
        department: true,
        position: true,
        manager: { select: { id: true, firstName: true, lastName: true } },
        directReports: { select: { id: true, firstName: true, lastName: true, position: true } },
        attendanceLogs: { orderBy: { date: "desc" }, take: 10 },
        leaveRequests: { orderBy: { createdAt: "desc" }, take: 5, include: { leaveType: true } },
        onboarding: { include: { tasks: { orderBy: { order: "asc" } } } },
        assets: { include: { asset: true } },
      },
    });

    if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(employee);
  } catch {
    return NextResponse.json({ error: "Failed to fetch employee" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!["SUPER_ADMIN", "ADMIN", "HR_MANAGER"].includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    const body = await request.json();

    const employee = await prisma.employee.update({
      where: { id, companyId: session.companyId ?? undefined },
      data: {
        ...body,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        joinDate: body.joinDate ? new Date(body.joinDate) : undefined,
        probationEndDate: body.probationEndDate ? new Date(body.probationEndDate) : undefined,
        confirmationDate: body.confirmationDate ? new Date(body.confirmationDate) : undefined,
        basicSalary: body.basicSalary ? parseFloat(body.basicSalary) : undefined,
      },
    });

    return NextResponse.json(employee);
  } catch {
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;

    await prisma.employee.update({
      where: { id, companyId: session.companyId ?? undefined },
      data: { employmentStatus: "TERMINATED" },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to terminate employee" }, { status: 500 });
  }
}
