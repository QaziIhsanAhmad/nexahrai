import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session.companyId) return NextResponse.json({ error: "No company" }, { status: 400 });

    const runs = await prisma.payrollRun.findMany({
      where: { companyId: session.companyId },
      include: { _count: { select: { items: true } } },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    return NextResponse.json(runs);
  } catch {
    return NextResponse.json({ error: "Failed to fetch payroll" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!["SUPER_ADMIN", "ADMIN", "HR_MANAGER"].includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!session.companyId) return NextResponse.json({ error: "No company" }, { status: 400 });

    const { month, year } = await request.json();

    const existing = await prisma.payrollRun.findUnique({
      where: { companyId_month_year: { companyId: session.companyId, month, year } },
    });
    if (existing) return NextResponse.json({ error: "Payroll already exists for this period" }, { status: 409 });

    const employees = await prisma.employee.findMany({
      where: { companyId: session.companyId, employmentStatus: "ACTIVE" },
    });

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const workingDaysInMonth = 22;

    const items = [];
    let totalGross = 0;
    let totalNet = 0;
    let totalDeductions = 0;

    for (const emp of employees) {
      const attendance = await prisma.attendanceLog.findMany({
        where: {
          employeeId: emp.id,
          date: { gte: startDate, lte: endDate },
          status: "PRESENT",
        },
      });

      const presentDays = attendance.length;
      const leaveDays = 0;
      const absentDays = Math.max(0, workingDaysInMonth - presentDays - leaveDays);

      const dailyRate = emp.basicSalary / workingDaysInMonth;
      const earnedSalary = dailyRate * presentDays;
      const overtimePay = attendance.reduce((sum, a) => sum + (a.overtime || 0) * (dailyRate / 8), 0);
      const grossPay = earnedSalary + overtimePay;
      const tax = grossPay * 0.1;
      const deductions = tax;
      const netPay = grossPay - deductions;

      items.push({
        employeeId: emp.id,
        basicSalary: emp.basicSalary,
        overtime: parseFloat(overtimePay.toFixed(2)),
        bonus: 0,
        tax: parseFloat(tax.toFixed(2)),
        grossPay: parseFloat(grossPay.toFixed(2)),
        netPay: parseFloat(netPay.toFixed(2)),
        workingDays: workingDaysInMonth,
        presentDays,
        leaveDays,
        absentDays,
      });

      totalGross += grossPay;
      totalNet += netPay;
      totalDeductions += deductions;
    }

    const run = await prisma.payrollRun.create({
      data: {
        companyId: session.companyId,
        month,
        year,
        status: "COMPLETED",
        totalGross: parseFloat(totalGross.toFixed(2)),
        totalNet: parseFloat(totalNet.toFixed(2)),
        totalDeductions: parseFloat(totalDeductions.toFixed(2)),
        processedAt: new Date(),
        processedBy: session.userId,
        items: { create: items },
      },
      include: { items: { include: { employee: true } } },
    });

    return NextResponse.json(run, { status: 201 });
  } catch (error) {
    console.error("Payroll error:", error);
    return NextResponse.json({ error: "Failed to run payroll" }, { status: 500 });
  }
}
