"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { PRICE_ID } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface PricingTableProps {
  isSubscribed: boolean;
}

const PricingTable = ({ isSubscribed }: PricingTableProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const userRole = (session?.user as any)?.role;

  const handleUpgradeStudent = async () => {
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

  const handleUpgradeTeacher = async () => {
    try {
      const response = await fetch("/api/stripe/create-teacher-checkout", {
        method: "POST",
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        console.error("Failed to create checkout session");
        alert("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      alert("Error creating checkout");
    }
  };

  const currentPlanName = isSubscribed
    ? (userRole === "TEACHER" ? "Education" : "Premium Student")
    : "Free";

  return (
    <div className="w-full px-8 md:px-16 lg:px-24 xl:px-32">
      <div className="text-center mb-20">
        <h1 className="text-6xl md:text-7xl font-bold mb-8 text-gray-900 dark:text-gray-100">
          Choose Your Plan
        </h1>
        <p className="text-2xl text-gray-600 dark:text-gray-400 mb-4">
          Select the perfect plan for your needs
        </p>
        <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
          <span className="text-lg text-gray-600 dark:text-gray-400">Current Plan:</span>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{currentPlanName}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 xl:gap-12 w-full max-w-[1400px] mx-auto">
        {/* Free Plan */}
        <div className="relative group">
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-10 transition-all duration-300 hover:shadow-2xl">
            {!isSubscribed && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                ✓ Current Plan
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">Free</h3>
              <p className="text-base text-gray-500 dark:text-gray-400">Perfect for getting started</p>
            </div>

            <div className="text-center mb-8 py-6">
              <div className="flex items-baseline justify-center">
                <span className="text-6xl font-extrabold text-gray-900 dark:text-gray-100">$0</span>
                <span className="text-xl text-gray-600 dark:text-gray-400 ml-2">/month</span>
              </div>
            </div>

            <Button
              disabled
              className="w-full mb-8 bg-gray-200 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-400 text-lg py-6 rounded-xl hover:bg-gray-200 font-semibold"
            >
              Current Plan
            </Button>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <Check className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 dark:text-gray-300 text-base">3 quiz uploads</span>
                </li>
                <li className="flex items-start gap-4">
                  <Check className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 dark:text-gray-300 text-base">Basic quiz generation</span>
                </li>
                <li className="flex items-start gap-4">
                  <Check className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 dark:text-gray-300 text-base">Join classes as student</span>
                </li>
                <li className="flex items-start gap-4">
                  <Check className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 dark:text-gray-300 text-base">Standard support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Premium Plan - Student */}
        <div className="relative group">
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl border-2 border-blue-600 dark:border-blue-500 p-10 transition-all duration-300 hover:shadow-2xl">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-8 py-2 rounded-full text-sm font-bold shadow-lg">
              Most Popular
            </div>

            {isSubscribed && userRole === "STUDENT" && (
              <div className="absolute -top-4 right-6 bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                ✓ Current Plan
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">Premium Student</h3>
              <p className="text-base text-gray-500 dark:text-gray-400">Best for students</p>
            </div>

            <div className="text-center mb-8 py-6">
              <div className="flex items-baseline justify-center">
                <span className="text-6xl font-extrabold text-gray-900 dark:text-gray-100">$4.99</span>
                <span className="text-xl text-gray-600 dark:text-gray-400 ml-2">/month</span>
              </div>
            </div>

            {userRole === "STUDENT" ? (
              isSubscribed ? (
                <Button disabled className="w-full mb-8 bg-gray-200 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-400 text-lg py-6 rounded-xl hover:bg-gray-200 font-semibold">
                  Current Plan
                </Button>
              ) : (
                <Button onClick={handleUpgradeStudent} className="w-full mb-8 bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
                  Switch to Premium
                </Button>
              )
            ) : (
              <Button disabled className="w-full mb-8 bg-gray-200 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-400 text-lg py-6 rounded-xl hover:bg-gray-200 font-semibold">
                For Students Only
              </Button>
            )}

            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <Check className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 dark:text-gray-300 text-base"><strong>Unlimited quizzes</strong></span>
                </li>
                <li className="flex items-start gap-4">
                  <Check className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 dark:text-gray-300 text-base">Advanced AI quiz generation</span>
                </li>
                <li className="flex items-start gap-4">
                  <Check className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 dark:text-gray-300 text-base">Misconception tracking</span>
                </li>
                <li className="flex items-start gap-4">
                  <Check className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 dark:text-gray-300 text-base">Spaced repetition learning</span>
                </li>
                <li className="flex items-start gap-4">
                  <Check className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 dark:text-gray-300 text-base">Priority support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Education Plan - Teacher */}
        <div className="relative group">
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-10 transition-all duration-300 hover:shadow-2xl">
            {isSubscribed && userRole === "TEACHER" && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                ✓ Current Plan
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">Education</h3>
              <p className="text-base text-gray-500 dark:text-gray-400">Special pricing for educators</p>
            </div>

            <div className="text-center mb-8 py-6">
              <div className="flex items-baseline justify-center">
                <span className="text-6xl font-extrabold text-gray-900 dark:text-gray-100">$9.99</span>
                <span className="text-xl text-gray-600 dark:text-gray-400 ml-2">/month</span>
              </div>
            </div>

            {userRole === "TEACHER" ? (
              isSubscribed ? (
                <Button disabled className="w-full mb-8 bg-gray-200 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-400 text-lg py-6 rounded-xl hover:bg-gray-200 font-semibold">
                  Current Plan
                </Button>
              ) : (
                <Button onClick={handleUpgradeTeacher} className="w-full mb-8 bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
                  Switch to Education
                </Button>
              )
            ) : (
              <Button disabled className="w-full mb-8 bg-gray-200 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-400 text-lg py-6 rounded-xl hover:bg-gray-200 font-semibold">
                For Teachers Only
              </Button>
            )}

            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <Check className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 dark:text-gray-300 text-base">Create unlimited classes</span>
                </li>
                <li className="flex items-start gap-4">
                  <Check className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 dark:text-gray-300 text-base">Assign quizzes to students</span>
                </li>
                <li className="flex items-start gap-4">
                  <Check className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 dark:text-gray-300 text-base">Class-wide analytics</span>
                </li>
                <li className="flex items-start gap-4">
                  <Check className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 dark:text-gray-300 text-base">Track student progress</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingTable; 