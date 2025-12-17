import { stripe } from "@/lib/stripe";
import { auth } from "@/auth";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404 }
      );
    }

    if (!user.stripeCustomerId) {
      return new Response(
        JSON.stringify({ error: "No Stripe customer ID found. Please contact support." }),
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Verify customer exists in Stripe, create new one if not
    let customerId = user.stripeCustomerId;
    try {
      await stripe.customers.retrieve(customerId);
    } catch (customerError: any) {
      if (customerError.code === 'resource_missing') {
        console.log(`Customer ${customerId} not found in Stripe, creating new customer`);

        // Create new customer
        const newCustomer = await stripe.customers.create({
          email: user.email || undefined,
          metadata: {
            dbId: userId,
          },
        });

        // Update database with new customer ID
        await db
          .update(users)
          .set({ stripeCustomerId: newCustomer.id })
          .where(eq(users.id, userId));

        customerId = newCustomer.id;
      } else {
        throw customerError;
      }
    }

    const sessionResponse = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/billing`,
    });

    return new Response(
      JSON.stringify({ url: sessionResponse.url }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error creating portal session:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to create portal session",
        message: error.message || "Unknown error"
      }),
      { status: 500 }
    );
  }
}
