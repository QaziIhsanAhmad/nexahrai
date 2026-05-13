import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session.companyId) return NextResponse.json([]);

    const types = await prisma.leaveTypeSetting.findMany({
      where: { companyId: session.companyId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(types);
  } catch {
    return NextResponse.json({ error: "Failed to fetch leave types" }, { status: 500 });
  }
}
