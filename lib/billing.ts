import Stripe from "stripe";

let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-04-22.dahlia" });
  }
  return _stripe;
}

export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    employeeLimit: 2,
    priceId: null,
    features: ["Up to 2 employees", "All core HR modules", "Basic analytics", "Email support"],
  },
  STARTER: {
    name: "Starter",
    price: 29,
    employeeLimit: 10,
    priceId: process.env.STRIPE_PRICE_STARTER,
    features: ["Up to 10 employees", "All core HR modules", "Advanced analytics", "AI tools (50 credits/mo)", "Priority email support"],
  },
  PROFESSIONAL: {
    name: "Professional",
    price: 79,
    employeeLimit: 50,
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL,
    features: ["Up to 50 employees", "All core HR modules", "Full analytics & reports", "AI tools (unlimited)", "Payroll automation", "Phone & email support"],
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: 199,
    employeeLimit: Infinity,
    priceId: process.env.STRIPE_PRICE_ENTERPRISE,
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
