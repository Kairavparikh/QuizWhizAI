import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createSubscription, deleteSubscription } from "@/app/actions/userSubscriptions";
console.log("🔔 Webhook triggered");

const relevantEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.created",
]);

export const POST = async (req: Request) => {
  console.log("🔔 Webhook POST received");
    
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") as string;

  console.log("🔔 Checking webhook secret...");
  const webHookSecret =
    process.env.NODE_ENV === "production"
      ? process.env.STRIPE_WEBHOOK_SECRET
      : process.env.STRIPE_WEBHOOK_LOCAL_SECRET;

  console.log("🔔 Webhook secret found:", !!webHookSecret);
  console.log("🔔 NODE_ENV:", process.env.NODE_ENV);

  if (!webHookSecret) {
    console.log("🔔 Webhook secret is missing!");
    throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  }

  if (!sig) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    console.log("🔔 Constructing event...");
    event = stripe.webhooks.constructEvent(body, sig, webHookSecret);
    console.log("🔔 Event constructed successfully");
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return new Response("Webhook Error", { status: 400 });
  }

  console.log("🔔 All event types:", event.type);
  console.log("🔔 Is relevant event:", relevantEvents.has(event.type));
  
  if (relevantEvents.has(event.type)) {
    console.log("🔔 Event type:", event.type);
    console.log("🔔 Event data:", JSON.stringify(event.data.object, null, 2));
    
    const data = event.data.object as Stripe.Subscription;

    switch (event.type) {
      case "checkout.session.completed":
        await createSubscription({
          stripeCustomerId: data.customer as string,
        });
        break;

      case "customer.subscription.created":
        await createSubscription({
          stripeCustomerId: data.customer as string,
        });
        break;

      case "customer.subscription.updated":
        // Ensure subscription is still marked as active after plan change
        if (data.status === "active") {
          await createSubscription({
            stripeCustomerId: data.customer as string,
          });
        } else if (data.status === "canceled" || data.status === "unpaid") {
          await deleteSubscription({
            stripeCustomerId: data.customer as string,
          });
        }
        break;

      case "customer.subscription.deleted":
        await deleteSubscription({
          stripeCustomerId: data.customer as string,
        });
        break;

      default:
        break;
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
};
