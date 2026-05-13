import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!["SUPER_ADMIN", "ADMIN", "HR_MANAGER", "MANAGER"].includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    const { action, rejectionNote } = await request.json();

    if (!["approve", "reject", "cancel"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const statusMap: Record<string, string> = {
      approve: "APPROVED",
      reject: "REJECTED",
      cancel: "CANCELLED",
    };

    const leave = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: statusMap[action] as never,
        approvedById: action === "approve" ? session.userId : undefined,
        approvedAt: action === "approve" ? new Date() : undefined,
        rejectionNote: action === "reject" ? rejectionNote : undefined,
      },
    });

    return NextResponse.json(leave);
  } catch {
    return NextResponse.json({ error: "Failed to update leave request" }, { status: 500 });
  }
}
