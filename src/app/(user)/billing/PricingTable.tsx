"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { PRICE_ID } from "@/lib/utils";

const PricingTable = () => {
  const handleUpgrade = async () => {
    // Check if Stripe key is available
    if (!process.env.NEXT_PUBLIC_PUBLISHABLE_KEY) {
      console.error("Stripe publishable key not found");
      alert("Payment system not configured");
      return;
    }

    try {
      const response = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price: PRICE_ID,
        }),
      });

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = await import('@stripe/stripe-js').then(({ loadStripe }) => 
        loadStripe(process.env.NEXT_PUBLIC_PUBLISHABLE_KEY!)
      );
      
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert("Error creating checkout session");
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Choose Your Plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className="border border-gray-700 rounded-lg p-6 bg-gray-800">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Free Plan</h3>
            <div className="text-3xl font-bold mb-4">$0</div>
            <ul className="space-y-3 text-left">
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                3 Free Quizzes
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                Basic Quiz Generation
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                Standard Support
              </li>
            </ul>
          </div>
        </div>

        {/* Premium Plan */}
        <div className="border border-blue-600 rounded-lg p-6 bg-gray-800">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Premium Plan</h3>
            <div className="text-3xl font-bold mb-4">$19.99<span className="text-sm font-normal">/month</span></div>
            <ul className="space-y-3 text-left">
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                Unlimited Quizzes
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                Advanced Quiz Generation
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                Priority Support
              </li>
            </ul>
            <Button 
              onClick={handleUpgrade}
              className="w-full mt-4" 
              variant="default"
            >
              Upgrade to Premium
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingTable; 