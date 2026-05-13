import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { calculateWorkingDays } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session.companyId) return NextResponse.json({ error: "No company" }, { status: 400 });

    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status");
    const employeeId = searchParams.get("employeeId");

    const isEmployee = session.role === "EMPLOYEE";

    let empId: string | undefined;
    if (isEmployee) {
      const emp = await prisma.employee.findFirst({ where: { userId: session.userId } });
      empId = emp?.id;
    } else if (employeeId) {
      empId = employeeId;
    }

    const requests = await prisma.leaveRequest.findMany({
      where: {
        companyId: session.companyId,
        ...(empId && { employeeId: empId }),
        ...(status && { status: status as never }),
      },
      include: {
        employee: { select: { firstName: true, lastName: true, employeeId: true, department: { select: { name: true } } } },
        leaveType: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch {
    return NextResponse.json({ error: "Failed to fetch leave requests" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session.companyId) return NextResponse.json({ error: "No company" }, { status: 400 });

    const body = await request.json();
    const { leaveTypeId, startDate, endDate, reason, attachmentUrl } = body;

    const employee = await prisma.employee.findFirst({ where: { userId: session.userId } });
    if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = calculateWorkingDays(start, end);

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId: employee.id,
        companyId: session.companyId,
        leaveTypeId,
        startDate: start,
        endDate: end,
        totalDays,
        reason,
        attachmentUrl,
      },
      include: { leaveType: true },
    });

    return NextResponse.json(leaveRequest, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to submit leave request" }, { status: 500 });
  }
}
