import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function GET() {
  try {
    // List all prices in your Stripe account
    const prices = await stripe.prices.list({
      limit: 100,
      expand: ["data.product"],
    });

    // Format the response nicely
    const formattedPrices = prices.data.map((price) => {
      let productName = "Unknown";
      let productId = "";

      if (typeof price.product === "string") {
        productId = price.product;
      } else if (price.product && "id" in price.product) {
        productId = price.product.id;
        if ("name" in price.product) {
          productName = price.product.name || "Unknown";
        }
      }

      return {
        id: price.id,
        amount: price.unit_amount ? price.unit_amount / 100 : 0,
        currency: price.currency,
        interval: price.recurring?.interval || "one-time",
        product: {
          id: productId,
          name: productName,
        },
        active: price.active,
        created: new Date(price.created * 1000).toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      count: formattedPrices.length,
      prices: formattedPrices,
    });
  } catch (error) {
    console.error("Error listing prices:", error);
    return NextResponse.json(
      {
        error: "Failed to list prices",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
