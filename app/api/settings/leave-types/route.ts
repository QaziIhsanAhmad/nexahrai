import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!["SUPER_ADMIN", "ADMIN", "HR_MANAGER"].includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!session.companyId) return NextResponse.json({ error: "No company" }, { status: 400 });

    const body = await request.json();
    const leaveType = await prisma.leaveTypeSetting.create({
      data: {
        companyId: session.companyId,
        leaveType: body.leaveType,
        name: body.name,
        daysAllowed: body.daysAllowed,
        isPaid: body.isPaid ?? true,
        carryForward: body.carryForward ?? false,
        description: body.description,
      },
    });

    return NextResponse.json(leaveType, { status: 201 });
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === "P2002") {
      return NextResponse.json({ error: "Leave type already configured" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
