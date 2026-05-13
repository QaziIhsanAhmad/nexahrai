import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session.companyId) return NextResponse.json([]);

    const docs = await prisma.document.findMany({
      where: {
        companyId: session.companyId,
        ...(session.role === "EMPLOYEE" ? { isPublic: true } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(docs);
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
    const doc = await prisma.document.create({
      data: {
        ...body,
        companyId: session.companyId,
        createdById: session.userId,
        tags: body.tags || [],
      },
    });

    return NextResponse.json(doc, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to add document" }, { status: 500 });
  }
}
