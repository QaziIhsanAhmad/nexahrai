import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { hashPassword, } from "@/lib/auth";
import { generateEmployeeId } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session.companyId) return NextResponse.json({ error: "No company" }, { status: 400 });

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") || "";
    const departmentId = searchParams.get("departmentId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {
      companyId: session.companyId,
      ...(departmentId && { departmentId }),
      ...(status && { employmentStatus: status }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { employeeId: { contains: search, mode: "insensitive" } },
          { user: { email: { contains: search, mode: "insensitive" } } },
        ],
      }),
    };

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
          user: { select: { email: true, avatar: true } },
          department: true,
          position: true,
          manager: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.employee.count({ where }),
    ]);

    return NextResponse.json({ employees, total, pages: Math.ceil(total / limit), page });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
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
    const {
      firstName, lastName, email, password = "Welcome@123",
      departmentId, positionId, managerId,
      joinDate, employmentType, basicSalary,
      phone, gender, dateOfBirth, nationality,
    } = body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 400 });

    const hashed = await hashPassword(password);
    const empId = generateEmployeeId("EMP");

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashed,
          name: `${firstName} ${lastName}`,
          role: "EMPLOYEE",
          companyId: session.companyId!,
        },
      });

      const employee = await tx.employee.create({
        data: {
          employeeId: empId,
          userId: user.id,
          companyId: session.companyId!,
          firstName,
          lastName,
          workEmail: email,
          phone,
          gender,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          nationality,
          departmentId,
          positionId,
          managerId,
          joinDate: joinDate ? new Date(joinDate) : new Date(),
          employmentType: employmentType || "FULL_TIME",
          basicSalary: parseFloat(basicSalary) || 0,
        },
      });

      // Create onboarding
      await tx.onboarding.create({
        data: {
          employeeId: employee.id,
          tasks: {
            create: [
              { title: "Submit ID documents", category: "DOCUMENTS", order: 1 },
              { title: "Sign employment contract", category: "DOCUMENTS", order: 2 },
              { title: "IT equipment setup", category: "IT", order: 3 },
              { title: "HR orientation session", category: "ORIENTATION", order: 4 },
              { title: "Department introduction", category: "ORIENTATION", order: 5 },
              { title: "Benefits enrollment", category: "BENEFITS", order: 6 },
            ],
          },
        },
      });

      return employee;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Create employee error:", error);
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}
