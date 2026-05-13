import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session.companyId) return NextResponse.json({ error: "No company" }, { status: 400 });

    const { searchParams } = request.nextUrl;
    const jobId = searchParams.get("jobId");
    const status = searchParams.get("status");

    const applications = await prisma.application.findMany({
      where: {
        jobPosting: { companyId: session.companyId },
        ...(jobId && { jobPostingId: jobId }),
        ...(status && { status: status as never }),
      },
      include: {
        candidate: true,
        jobPosting: { select: { title: true } },
        aiScreening: true,
        interviews: { orderBy: { scheduledAt: "desc" }, take: 1 },
      },
      orderBy: { appliedAt: "desc" },
    });

    return NextResponse.json(applications);
  } catch {
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobPostingId, firstName, lastName, email, phone, coverLetter, resumeUrl } = body;

    let candidate = await prisma.candidate.findFirst({ where: { email } });
    if (!candidate) {
      candidate = await prisma.candidate.create({
        data: { firstName, lastName, email, phone },
      });
    }

    const existing = await prisma.application.findUnique({
      where: { jobPostingId_candidateId: { jobPostingId, candidateId: candidate.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "Already applied" }, { status: 409 });
    }

    const application = await prisma.application.create({
      data: { jobPostingId, candidateId: candidate.id, coverLetter, resumeUrl },
      include: { candidate: true, jobPosting: true },
    });

    return NextResponse.json(application, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}
