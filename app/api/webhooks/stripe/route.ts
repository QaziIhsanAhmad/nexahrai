import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/billing";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const PLAN_BY_PRICE: Record<string, string> = {
  [process.env.STRIPE_PRICE_STARTER ?? ""]: "STARTER",
  [process.env.STRIPE_PRICE_PROFESSIONAL ?? ""]: "PROFESSIONAL",
  [process.env.STRIPE_PRICE_ENTERPRISE ?? ""]: "ENTERPRISE",
};

// Calculate next renewal ~30 days out (used when exact period_end not available)
function nextRenewal(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        const companyId = checkoutSession.metadata?.companyId;
        const plan = checkoutSession.metadata?.plan;
        const subscriptionId = checkoutSession.subscription as string;

        if (companyId && plan && subscriptionId) {
          const sub = await getStripe().subscriptions.retrieve(subscriptionId);
          const priceId = sub.items.data[0]?.price.id;
          await prisma.company.update({
            where: { id: companyId },
            data: {
              plan: plan as "STARTER" | "PROFESSIONAL" | "ENTERPRISE",
              stripeSubscriptionId: subscriptionId,
              stripePriceId: priceId,
              planExpiresAt: nextRenewal(),
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const companyId = sub.metadata?.companyId;
        const priceId = sub.items.data[0]?.price.id;
        const plan = PLAN_BY_PRICE[priceId ?? ""] ?? "FREE";

        if (companyId) {
          await prisma.company.update({
            where: { id: companyId },
            data: {
              plan: plan as "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE",
              stripePriceId: priceId,
              planExpiresAt: nextRenewal(),
              stripeSubscriptionId: sub.id,
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const companyId = sub.metadata?.companyId;
        if (companyId) {
          await prisma.company.update({
            where: { id: companyId },
            data: {
              plan: "FREE",
              stripeSubscriptionId: null,
              stripePriceId: null,
              planExpiresAt: null,
            },
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : null;
        if (customerId) {
          await prisma.company.update({
            where: { stripeCustomerId: customerId },
            data: { plan: "FREE" },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
