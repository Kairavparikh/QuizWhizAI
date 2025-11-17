import { stripe } from "@/lib/stripe";
import { auth } from "@/auth";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";

export const POST = async () => {
  const userSession = await auth();
  const userId = userSession?.user?.id;

  if (!userId) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
      }),
      {
        status: 401,
      }
    );
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  let customer;
  if (user?.stripeCustomerId) {
    customer = {
      id: user.stripeCustomerId,
    };
  } else {
    const customerData: {
      metadata: {
        dbId: string;
      };
    } = {
      metadata: {
        dbId: userId,
      },
    };

    const response = await stripe.customers.create(customerData);
    customer = { id: response.id };

    await db.update(users).set({
      stripeCustomerId: customer.id,
    }).where(eq(users.id, userId));
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // Education Plan Price ID - you'll need to create this in Stripe Dashboard
  const educationPlanPriceId = process.env.STRIPE_EDUCATION_PRICE_ID || "price_education_plan";

  try {
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
      return new Response(
        JSON.stringify({
          error: "Failed to create checkout session",
        }),
        {
          status: 500,
        }
      );
    }
  } catch (error) {
    console.error("Error creating teacher checkout session:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
      }
    );
  }
};
