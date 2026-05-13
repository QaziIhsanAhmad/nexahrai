import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session.companyId) return NextResponse.json({ error: "No company" }, { status: 400 });

    const { searchParams } = request.nextUrl;
    const type = searchParams.get("type") || "overview";
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

    const companyId = session.companyId;

    if (type === "overview") {
      const [
        totalEmployees,
        activeEmployees,
        totalJobs,
        totalApplications,
        hiredThisYear,
        payrollThisYear,
        attendanceToday,
        pendingLeaves,
      ] = await Promise.all([
        prisma.employee.count({ where: { companyId } }),
        prisma.employee.count({ where: { companyId, employmentStatus: "ACTIVE" } }),
        prisma.jobPosting.count({ where: { companyId } }),
        prisma.application.count({ where: { jobPosting: { companyId } } }),
        prisma.employee.count({
          where: {
            companyId,
            joinDate: {
              gte: new Date(year, 0, 1),
              lte: new Date(year, 11, 31),
            },
          },
        }),
        prisma.payrollRun.aggregate({
          where: { companyId, year },
          _sum: { totalNet: true },
        }),
        prisma.attendanceLog.count({
          where: {
            companyId,
            date: new Date(new Date().toDateString()),
            checkIn: { not: null },
          },
        }),
        prisma.leaveRequest.count({ where: { companyId, status: "PENDING" } }),
      ]);

      return NextResponse.json({
        totalEmployees,
        activeEmployees,
        totalJobs,
        totalApplications,
        hiredThisYear,
        payrollThisYear: payrollThisYear._sum.totalNet || 0,
        attendanceToday,
        pendingLeaves,
      });
    }

    if (type === "headcount") {
      const months = Array.from({ length: 12 }, (_, i) => i + 1);
      const data = await Promise.all(
        months.map(async (month) => {
          const count = await prisma.employee.count({
            where: {
              companyId,
              joinDate: { lte: new Date(year, month - 1, 31) },
              OR: [
                { employmentStatus: { in: ["ACTIVE", "ON_LEAVE"] } },
                {
                  employmentStatus: { in: ["TERMINATED", "RESIGNED"] },
                  updatedAt: { gte: new Date(year, month - 1, 1) },
                },
              ],
            },
          });
          return {
            month: new Date(year, month - 1).toLocaleString("default", { month: "short" }),
            count,
          };
        })
      );
      return NextResponse.json(data);
    }

    if (type === "recruitment") {
      const pipeline = await prisma.application.groupBy({
        by: ["status"],
        where: { jobPosting: { companyId } },
        _count: { id: true },
      });

      const monthly = await Promise.all(
        Array.from({ length: 12 }, (_, i) => i + 1).map(async (month) => {
          const [apps, hired] = await Promise.all([
            prisma.application.count({
              where: {
                jobPosting: { companyId },
                appliedAt: {
                  gte: new Date(year, month - 1, 1),
                  lte: new Date(year, month, 0),
                },
              },
            }),
            prisma.application.count({
              where: {
                jobPosting: { companyId },
                status: "HIRED",
                updatedAt: {
                  gte: new Date(year, month - 1, 1),
                  lte: new Date(year, month, 0),
                },
              },
            }),
          ]);
          return {
            month: new Date(year, month - 1).toLocaleString("default", { month: "short" }),
            applications: apps,
            hired,
          };
        })
      );

      return NextResponse.json({ pipeline, monthly });
    }

    if (type === "payroll") {
      const monthly = await prisma.payrollRun.findMany({
        where: { companyId, year },
        orderBy: { month: "asc" },
        select: { month: true, totalGross: true, totalNet: true, totalDeductions: true },
      });

      return NextResponse.json(
        monthly.map((r) => ({
          month: new Date(year, r.month - 1).toLocaleString("default", { month: "short" }),
          gross: r.totalGross,
          net: r.totalNet,
          deductions: r.totalDeductions,
        }))
      );
    }

    if (type === "departments") {
      const depts = await prisma.department.findMany({
        where: { companyId },
        include: { _count: { select: { employees: true } } },
      });
      return NextResponse.json(depts.map((d) => ({ name: d.name, count: d._count.employees })));
    }

    return NextResponse.json({ error: "Unknown analytics type" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
