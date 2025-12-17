import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { priceId } = await req.json();

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has a Stripe customer ID
    if (!user.stripeCustomerId) {
      return NextResponse.json(
        {
          error: "No Stripe customer found. Please create a subscription first.",
          action: "create_new"
        },
        { status: 400 }
      );
    }

    // Verify customer exists in Stripe
    let customerId = user.stripeCustomerId;
    try {
      const existingCustomer = await stripe.customers.retrieve(customerId);
      if (existingCustomer.deleted) {
        throw new Error("Customer was deleted");
      }
    } catch (customerError: any) {
      if (customerError.code === 'resource_missing') {
        return NextResponse.json(
          {
            error: "Stripe customer not found. Please create a new subscription first.",
            action: "create_new"
          },
          { status: 404 }
        );
      }
      throw customerError;
    }

    // Get the customer's subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json(
        {
          error: "No active subscription found. Please create a new subscription first.",
          action: "create_new"
        },
        { status: 404 }
      );
    }

    const subscription = subscriptions.data[0];
    const currentSubscriptionItem = subscription.items.data[0];

    // Update the subscription to the new price
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.id,
      {
        items: [
          {
            id: currentSubscriptionItem.id,
            price: priceId,
          },
        ],
        proration_behavior: "create_prorations", // Charge/credit the difference immediately
      }
    );

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
      message: "Subscription updated successfully",
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      {
        error: "Failed to update subscription",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
