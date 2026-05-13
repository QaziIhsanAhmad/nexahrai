export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    employeeLimit: 2,
    priceId: null as null,
    features: ["Up to 2 employees", "All core HR modules", "Basic analytics", "Email support"],
  },
  STARTER: {
    name: "Starter",
    price: 29,
    employeeLimit: 10,
    priceId: process.env.STRIPE_PRICE_STARTER ?? null,
    features: ["Up to 10 employees", "All core HR modules", "Advanced analytics", "AI tools (50 credits/mo)", "Priority email support"],
  },
  PROFESSIONAL: {
    name: "Professional",
    price: 79,
    employeeLimit: 50,
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL ?? null,
    features: ["Up to 50 employees", "All core HR modules", "Full analytics & reports", "AI tools (unlimited)", "Payroll automation", "Phone & email support"],
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: 199,
    employeeLimit: Infinity,
    priceId: process.env.STRIPE_PRICE_ENTERPRISE ?? null,
    features: ["Unlimited employees", "All modules + custom workflows", "Full analytics & reports", "AI tools (unlimited)", "Dedicated account manager", "SLA support"],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export function getPlanLimit(plan: string): number {
  return PLANS[plan as PlanKey]?.employeeLimit ?? 2;
}

export function getPlanDetails(plan: string) {
  return PLANS[plan as PlanKey] ?? PLANS.FREE;
}
