import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session.companyId) return NextResponse.json({ error: "No company" }, { status: 400 });

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {
      companyId: session.companyId,
      ...(status === "active" && { isActive: true, isPublished: true }),
      ...(status === "draft" && { isPublished: false }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const jobs = await prisma.jobPosting.findMany({
      where,
      include: {
        position: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(jobs);
  } catch {
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
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
    const job = await prisma.jobPosting.create({
      data: {
        ...body,
        companyId: session.companyId,
        createdById: session.userId,
        deadline: body.deadline ? new Date(body.deadline) : undefined,
        publishedAt: body.isPublished ? new Date() : undefined,
        skills: body.skills || [],
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
