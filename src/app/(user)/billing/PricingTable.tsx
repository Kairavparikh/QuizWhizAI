"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { PRICE_ID } from "@/lib/utils";
interface PricingTableProps {
  isSubscribed: boolean;
}
const PricingTable = ({ isSubscribed }: PricingTableProps) => {
  
  const handleUpgrade = async () => {
    console.log("Upgrade button clicked");
    
    // Check if Stripe key is available
    if (!process.env.NEXT_PUBLIC_PUBLISHABLE_KEY) {
      console.error("Stripe publishable key not found");
      alert("Payment system not configured");
      return;
    }

    try {
      console.log("Making API call to checkout-session with price:", PRICE_ID);
      const response = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price: PRICE_ID,
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      
      if (!response.ok) {
        console.error("API error:", responseText);
        alert(`API Error: ${response.status} - ${responseText}`);
        return;
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse JSON:", parseError);
        alert("Invalid response from server");
        return;
      }
      
      console.log("Parsed response data:", data);
      
      if (!data.sessionId) {
        console.error("No sessionId in response");
        alert("No session ID received from server");
        return;
      }
      
      // Redirect to Stripe Checkout
      const stripe = await import('@stripe/stripe-js').then(({ loadStripe }) => 
        loadStripe(process.env.NEXT_PUBLIC_PUBLISHABLE_KEY!)
      );
      
      if (stripe) {
        console.log("Redirecting to Stripe checkout with sessionId:", data.sessionId);
        const result = await stripe.redirectToCheckout({ sessionId: data.sessionId });
        
        if (result.error) {
          console.error("Stripe redirect error:", result.error);
          alert(`Stripe error: ${result.error.message}`);
        }
      } else {
        console.error("Stripe failed to load");
        alert("Stripe failed to load");
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
            {isSubscribed ? (
              <Button disabled className="w-full mt-4">
                You&#39;re already Premium
              </Button>
            ) : (
              <Button onClick={handleUpgrade} className="w-full mt-4">
                Upgrade to Premium
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingTable; 