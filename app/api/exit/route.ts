import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session.companyId) return NextResponse.json([]);

    const where = session.role === "EMPLOYEE"
      ? { employee: { userId: session.userId } }
      : { companyId: session.companyId };

    const requests = await prisma.exitRequest.findMany({
      where,
      include: {
        employee: {
          include: {
            department: { select: { name: true } },
            position: { select: { title: true } },
          },
        },
        clearanceItems: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session.companyId) return NextResponse.json({ error: "No company" }, { status: 400 });

    const body = await request.json();
    const employee = await prisma.employee.findFirst({ where: { userId: session.userId } });
    if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

    const existing = await prisma.exitRequest.findUnique({ where: { employeeId: employee.id } });
    if (existing) return NextResponse.json({ error: "Exit request already exists" }, { status: 409 });

    const exitRequest = await prisma.exitRequest.create({
      data: {
        employeeId: employee.id,
        companyId: session.companyId,
        resignationType: body.resignationType || "RESIGNATION",
        lastWorkingDate: new Date(body.lastWorkingDate),
        reason: body.reason,
        noticePeriod: body.noticePeriod || 30,
        clearanceItems: {
          create: [
            { department: "IT", item: "Laptop & devices return" },
            { department: "IT", item: "System access revocation" },
            { department: "Finance", item: "Expense claims settlement" },
            { department: "Finance", item: "Final salary processing" },
            { department: "HR", item: "Exit interview" },
            { department: "HR", item: "Experience letter issuance" },
            { department: "Admin", item: "Office key/access card return" },
          ],
        },
      },
      include: { clearanceItems: true },
    });

    return NextResponse.json(exitRequest, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to submit exit request" }, { status: 500 });
  }
}
