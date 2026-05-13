"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PLANS } from "@/lib/plans";

import type { PlanKey } from "@/lib/plans";

interface Subscription {
  plan: PlanKey;
  planDetails: { name: string; price: number; employeeLimit: number; features: readonly string[] };
  planExpiresAt: string | null;
  hasStripeSubscription: boolean;
  employeeCount: number;
  employeeLimit: number | null;
  canAddEmployee: boolean;
}

const PLAN_COLORS: Record<PlanKey, string> = {
  FREE: "bg-slate-100 text-slate-700 border-slate-200",
  STARTER: "bg-blue-100 text-blue-700 border-blue-200",
  PROFESSIONAL: "bg-purple-100 text-purple-700 border-purple-200",
  ENTERPRISE: "bg-amber-100 text-amber-700 border-amber-200",
};

const PLAN_RING: Record<PlanKey, string> = {
  FREE: "ring-slate-200",
  STARTER: "ring-blue-400",
  PROFESSIONAL: "ring-purple-500",
  ENTERPRISE: "ring-amber-500",
};

export default function BillingPage() {
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetch("/api/billing/subscription")
      .then((r) => r.json())
      .then(setSub)
      .catch(() => toast.error("Failed to load subscription"))
      .finally(() => setLoading(false));
  }, []);

  async function handleUpgrade(plan: PlanKey) {
    if (plan === "FREE") return;
    setCheckoutLoading(plan);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.url;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to start checkout");
      setCheckoutLoading(null);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.url;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to open portal");
    } finally {
      setPortalLoading(false);
    }
  }

  const plans = Object.entries(PLANS) as [PlanKey, typeof PLANS[PlanKey]][];
  const usagePercent = sub
    ? sub.employeeLimit
      ? Math.min((sub.employeeCount / sub.employeeLimit) * 100, 100)
      : 0
    : 0;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing & Subscription</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your plan and payment details</p>
      </div>

      {/* Current Plan Card */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse h-32" />
      ) : sub && (
        <div className={`bg-white rounded-xl border-2 ${PLAN_RING[sub.plan]} ring-2 p-6`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-lg font-bold text-slate-900">Current Plan</h2>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${PLAN_COLORS[sub.plan]}`}>
                  {sub.planDetails.name}
                </span>
              </div>
              <p className="text-slate-500 text-sm">
                {sub.planDetails.price === 0
                  ? "Free forever"
                  : `$${sub.planDetails.price}/month`}
                {sub.planExpiresAt && ` · Renews ${new Date(sub.planExpiresAt).toLocaleDateString()}`}
              </p>

              {/* Employee usage bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-slate-600 font-medium">Employees</span>
                  <span className={`font-semibold ${!sub.canAddEmployee ? "text-red-600" : "text-slate-700"}`}>
                    {sub.employeeCount} / {sub.employeeLimit ?? "∞"}
                  </span>
                </div>
                {sub.employeeLimit && (
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${usagePercent >= 100 ? "bg-red-500" : usagePercent >= 80 ? "bg-amber-500" : "bg-blue-500"}`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                )}
                {!sub.canAddEmployee && (
                  <p className="text-xs text-red-600 mt-1.5 font-medium">
                    ⚠ Employee limit reached. Upgrade to add more employees.
                  </p>
                )}
              </div>
            </div>

            {sub.hasStripeSubscription && (
              <button
                onClick={handlePortal}
                disabled={portalLoading}
                className="flex-shrink-0 text-sm text-blue-600 hover:text-blue-700 font-medium border border-blue-200 rounded-lg px-4 py-2 hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                {portalLoading ? "Loading..." : "Manage Billing"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pricing Plans */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {plans.map(([key, plan]) => {
            const isCurrent = sub?.plan === key;
            const isPopular = key === "PROFESSIONAL";
            return (
              <div
                key={key}
                className={`relative bg-white rounded-xl border-2 p-5 flex flex-col transition-all ${
                  isCurrent ? `${PLAN_RING[key]} ring-2` : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">Current</span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="font-bold text-slate-900 text-base">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-slate-900">${plan.price}</span>
                    {plan.price > 0 && <span className="text-slate-400 text-sm">/mo</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {plan.employeeLimit === Infinity ? "Unlimited employees" : `Up to ${plan.employeeLimit} employees`}
                  </p>
                </div>

                <ul className="space-y-2 flex-1 mb-5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs text-slate-600">
                      <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {key === "FREE" ? (
                  <button disabled className="w-full text-sm py-2 rounded-lg border border-slate-200 text-slate-400 cursor-not-allowed">
                    {isCurrent ? "Current Plan" : "Free"}
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(key)}
                    disabled={isCurrent || checkoutLoading === key}
                    className={`w-full text-sm py-2 rounded-lg font-medium transition-colors ${
                      isCurrent
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : isPopular
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    } disabled:opacity-60`}
                  >
                    {checkoutLoading === key
                      ? "Redirecting..."
                      : isCurrent
                      ? "Current Plan"
                      : `Upgrade to ${plan.name}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: "Can I change my plan anytime?", a: "Yes. Upgrades take effect immediately and you're billed pro-rata. Downgrades take effect at the end of your billing period." },
            { q: "What happens when I exceed the employee limit?", a: "You won't be able to add new employees until you upgrade. Existing employees and data remain unaffected." },
            { q: "Is there a free trial?", a: "The Free plan is free forever with up to 2 employees — no credit card required." },
            { q: "How do I cancel?", a: "Click 'Manage Billing' to access the Stripe portal where you can cancel anytime. You'll retain access until the end of the billing period." },
          ].map(({ q, a }) => (
            <div key={q}>
              <p className="text-sm font-medium text-slate-800">{q}</p>
              <p className="text-sm text-slate-500 mt-0.5">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
