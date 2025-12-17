import { stripe } from "@/lib/stripe";
import { auth } from "@/auth";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";

export const POST = async () => {
  console.log("🎓 Teacher checkout endpoint called");

  const userSession = await auth();
  const userId = userSession?.user?.id;

  console.log("🎓 User ID:", userId);

  if (!userId) {
    console.error("🎓 No user ID found - unauthorized");
    return new Response(
      JSON.stringify({
        error: "Unauthorized - Please log in first",
      }),
      {
        status: 401,
      }
    );
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  console.log("🎓 User found:", !!user);
  console.log("🎓 User email:", user?.email);
  console.log("🎓 Existing customer ID:", user?.stripeCustomerId);

  if (!user) {
    console.error("🎓 User not found in database");
    return new Response(
      JSON.stringify({
        error: "User not found in database",
      }),
      {
        status: 404,
      }
    );
  }

  let customer;
  if (user?.stripeCustomerId) {
    // Verify customer exists in Stripe
    try {
      const existingCustomer = await stripe.customers.retrieve(user.stripeCustomerId);
      if (existingCustomer.deleted) {
        throw new Error("Customer was deleted");
      }
      customer = {
        id: user.stripeCustomerId,
      };
      console.log("Using existing customer:", customer.id);
    } catch (customerError: any) {
      // Customer doesn't exist in Stripe, create new one
      console.log("Customer not found in Stripe, creating new customer");
      const response = await stripe.customers.create({
        email: user.email || undefined,
        metadata: {
          dbId: userId,
        },
      });

      customer = { id: response.id };
      console.log("Created new customer:", customer.id);

      // Update database with new customer ID
      await db.update(users).set({
        stripeCustomerId: customer.id,
      }).where(eq(users.id, userId));
    }
  } else {
    console.log("Creating new customer for user:", userId);
    const customerData: {
      metadata: {
        dbId: string;
      };
      email?: string;
    } = {
      metadata: {
        dbId: userId,
      },
    };

    if (user.email) {
      customerData.email = user.email;
    }

    const response = await stripe.customers.create(customerData);
    customer = { id: response.id };
    console.log("Created new customer:", customer.id);

    await db.update(users).set({
      stripeCustomerId: customer.id,
    }).where(eq(users.id, userId));
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  console.log("🎓 Base URL:", baseUrl);

  // Education Plan Price ID - $9.99/month
  const educationPlanPriceId = process.env.STRIPE_EDUCATION_PRICE_ID || "price_1SUDHbDJtFkaXjyBAhpySPCT";
  console.log("🎓 Education price ID:", educationPlanPriceId);
  console.log("🎓 Customer ID for checkout:", customer.id);

  try {
    console.log("🎓 Creating Stripe checkout session...");
    const session = await stripe.checkout.sessions.create({
      success_url: `${baseUrl}/teacher/dashboard`,
      cancel_url: `${baseUrl}/teacher/setup`,
      customer: customer.id,
      payment_method_types: ["card"],
      line_items: [
        {
          price: educationPlanPriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        metadata: {
          userId: userId,
          plan: "education",
        },
      },
    });

    console.log("🎓 Checkout session created:", session.id);
    console.log("🎓 Checkout URL:", session.url);

    if (session.url) {
      return new Response(
        JSON.stringify({
          url: session.url,
        }),
        {
          status: 200,
        }
      );
    } else {
      console.error("🎓 No URL in session object");
      return new Response(
        JSON.stringify({
          error: "Failed to create checkout session - no URL returned",
        }),
        {
          status: 500,
        }
      );
    }
  } catch (error) {
    console.error("🎓 Error creating teacher checkout session:", error);
    console.error("🎓 Error details:", error instanceof Error ? error.message : "Unknown error");
    console.error("🎓 Full error:", JSON.stringify(error, null, 2));
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        details: "Check server logs for more information",
      }),
      {
        status: 500,
      }
    );
  }
};
