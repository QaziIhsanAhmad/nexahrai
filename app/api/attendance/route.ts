import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session.companyId) return NextResponse.json({ error: "No company" }, { status: 400 });

    const { searchParams } = request.nextUrl;
    const employeeId = searchParams.get("employeeId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: Record<string, unknown> = {
      companyId: session.companyId,
      ...(employeeId && { employeeId }),
      ...(from || to
        ? {
            date: {
              ...(from && { gte: new Date(from) }),
              ...(to && { lte: new Date(to) }),
            },
          }
        : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.attendanceLog.findMany({
        where,
        include: {
          employee: { select: { firstName: true, lastName: true, employeeId: true } },
        },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.attendanceLog.count({ where }),
    ]);

    return NextResponse.json({ logs, total, pages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session.companyId) return NextResponse.json({ error: "No company" }, { status: 400 });

    const { action, employeeId: empId, notes } = await request.json();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const employee = await prisma.employee.findFirst({
      where: { companyId: session.companyId, id: empId || undefined, userId: empId ? undefined : session.userId },
    });

    if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

    const existing = await prisma.attendanceLog.findUnique({
      where: { employeeId_date: { employeeId: employee.id, date: today } },
    });

    if (action === "checkin") {
      if (existing?.checkIn) return NextResponse.json({ error: "Already checked in" }, { status: 400 });

      const log = existing
        ? await prisma.attendanceLog.update({
            where: { id: existing.id },
            data: { checkIn: new Date(), status: "PRESENT" },
          })
        : await prisma.attendanceLog.create({
            data: {
              employeeId: employee.id,
              companyId: session.companyId,
              date: today,
              checkIn: new Date(),
              status: "PRESENT",
              notes,
            },
          });
      return NextResponse.json(log);
    }

    if (action === "checkout") {
      if (!existing?.checkIn) return NextResponse.json({ error: "Not checked in" }, { status: 400 });
      if (existing.checkOut) return NextResponse.json({ error: "Already checked out" }, { status: 400 });

      const checkOut = new Date();
      const totalMs = checkOut.getTime() - existing.checkIn!.getTime();
      const totalHours = parseFloat((totalMs / 3600000).toFixed(2));
      const overtime = Math.max(0, totalHours - 8);

      const log = await prisma.attendanceLog.update({
        where: { id: existing.id },
        data: { checkOut, totalHours, overtime, notes },
      });
      return NextResponse.json(log);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Attendance action failed" }, { status: 500 });
  }
}
