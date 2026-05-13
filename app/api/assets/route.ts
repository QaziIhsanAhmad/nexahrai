import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session.companyId) return NextResponse.json([]);

    const assets = await prisma.asset.findMany({
      where: { companyId: session.companyId },
      include: {
        assignments: {
          where: { returnedAt: null },
          include: { employee: { select: { firstName: true, lastName: true } } },
          take: 1,
          orderBy: { assignedAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(assets);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
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
    const count = await prisma.asset.count({ where: { companyId: session.companyId } });
    const assetId = `ASSET-${String(count + 1).padStart(4, "0")}`;

    const asset = await prisma.asset.create({
      data: {
        ...body,
        assetId,
        companyId: session.companyId,
        status: "AVAILABLE",
      },
    });

    return NextResponse.json(asset, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to add asset" }, { status: 500 });
  }
}
