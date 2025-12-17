import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";

/**
 * Reset user's Stripe customer data
 * This is useful when there's a mismatch between database and Stripe
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Clear the Stripe customer ID and subscription status
    await db
      .update(users)
      .set({
        stripeCustomerId: null,
        subscribed: false,
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      success: true,
      message: "Stripe customer data has been reset. You can now create a new subscription.",
    });
  } catch (error) {
    console.error("Error resetting customer data:", error);
    return NextResponse.json(
      {
        error: "Failed to reset customer data",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
