import Stripe from "stripe";
export { PLANS, getPlanLimit, getPlanDetails } from "./plans";
export type { PlanKey } from "./plans";

let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-04-22.dahlia" });
  }
  return _stripe;
}
