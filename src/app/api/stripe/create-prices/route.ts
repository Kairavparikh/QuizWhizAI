import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST() {
  try {
    const results = {
      premiumPlan: null as any,
      educationPlan: null as any,
      errors: [] as string[],
    };

    // Create Premium Student Plan Product & Price
    try {
      console.log("Creating Premium Student product...");
      const premiumProduct = await stripe.products.create({
        name: "Premium Plan",
        description: "Premium access includes unlimited quizzes, AI-driven misconception detection, spaced repetition algorithms, and personalized learning insights with priority support.",
      });

      console.log("Creating Premium Student price...");
      const premiumPrice = await stripe.prices.create({
        product: premiumProduct.id,
        unit_amount: 499, // $4.99
        currency: "usd",
        recurring: {
          interval: "month",
        },
      });

      results.premiumPlan = {
        productId: premiumProduct.id,
        priceId: premiumPrice.id,
        amount: 4.99,
      };

      console.log("✅ Premium Plan created:", premiumPrice.id);
    } catch (error) {
      const errorMsg = `Failed to create Premium Plan: ${error instanceof Error ? error.message : "Unknown error"}`;
      console.error(errorMsg);
      results.errors.push(errorMsg);
    }

    // Create Education Plan Product & Price
    try {
      console.log("Creating Education product...");
      const educationProduct = await stripe.products.create({
        name: "Education Plan",
        description: "Create unlimited classes, generate AI-powered quizzes, assign them to students, and track progress with real-time analytics. Identify class misconceptions, get teaching recommendations, export reports, and access the full teacher dashboard with priority support. Perfect for educators of all levels.",
      });

      console.log("Creating Education price...");
      const educationPrice = await stripe.prices.create({
        product: educationProduct.id,
        unit_amount: 999, // $9.99
        currency: "usd",
        recurring: {
          interval: "month",
        },
      });

      results.educationPlan = {
        productId: educationProduct.id,
        priceId: educationPrice.id,
        amount: 9.99,
      };

      console.log("✅ Education Plan created:", educationPrice.id);
    } catch (error) {
      const errorMsg = `Failed to create Education Plan: ${error instanceof Error ? error.message : "Unknown error"}`;
      console.error(errorMsg);
      results.errors.push(errorMsg);
    }

    if (results.errors.length > 0 && !results.premiumPlan && !results.educationPlan) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create any prices",
          details: results.errors,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Prices created successfully!",
      results,
      instructions: {
        nextSteps: [
          "Copy the price IDs below",
          "Update your .env file:",
          `  - Set PRICE_ID to ${results.premiumPlan?.priceId || "N/A"} in src/lib/utils.ts`,
          `  - Set STRIPE_EDUCATION_PRICE_ID to ${results.educationPlan?.priceId || "N/A"} in .env`,
          `  - Set NEXT_PUBLIC_EDUCATION_PRICE_ID to ${results.educationPlan?.priceId || "N/A"} in .env`,
        ],
      },
    });
  } catch (error) {
    console.error("Error creating prices:", error);
    return NextResponse.json(
      {
        error: "Failed to create prices",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
