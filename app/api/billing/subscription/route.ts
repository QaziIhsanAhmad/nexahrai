import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlanDetails } from "@/lib/billing";

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session.companyId) return NextResponse.json({ error: "No company" }, { status: 400 });

    const company = await prisma.company.findUnique({
      where: { id: session.companyId },
      select: { plan: true, planExpiresAt: true, stripeCustomerId: true, stripeSubscriptionId: true },
    });

    const employeeCount = await prisma.employee.count({
      where: { companyId: session.companyId, employmentStatus: { not: "TERMINATED" } },
    });

    const planDetails = getPlanDetails(company?.plan ?? "FREE");

    return NextResponse.json({
      plan: company?.plan ?? "FREE",
      planDetails,
      planExpiresAt: company?.planExpiresAt,
      hasStripeSubscription: !!company?.stripeSubscriptionId,
      employeeCount,
      employeeLimit: planDetails.employeeLimit === Infinity ? null : planDetails.employeeLimit,
      canAddEmployee: employeeCount < planDetails.employeeLimit,
    });
  } catch (error) {
    console.error("Subscription fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 });
  }
}
