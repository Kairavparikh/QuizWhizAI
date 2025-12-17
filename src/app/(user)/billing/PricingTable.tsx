"use client";

import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, GraduationCap, ArrowRight, Crown, Star, X } from "lucide-react";
import { PRICE_ID } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, useInView } from "framer-motion";
import { useState, useRef } from "react";

// Price IDs for all plans
const PREMIUM_STUDENT_PRICE_ID = PRICE_ID; // $4.99/month
const EDUCATION_PRICE_ID = process.env.NEXT_PUBLIC_EDUCATION_PRICE_ID || "price_1SUDHbDJtFkaXjyBAhpySPCT"; // $9.99/month

interface PricingTableProps {
  isSubscribed: boolean;
}

const PricingTable = ({ isSubscribed }: PricingTableProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const userRole = (session?.user as any)?.role;
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  const handleUpgradeStudent = async () => {
    console.log("Upgrade button clicked");

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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("API error:", errorData);
        alert(`Failed to create checkout: ${errorData.error || "Unknown error"}`);
        return;
      }

      const data = await response.json();
      console.log("Parsed response data:", data);

      if (!data.sessionId) {
        console.error("No sessionId in response");
        alert("No session ID received from server");
        return;
      }

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
      console.log("Creating teacher checkout session...");
      const response = await fetch("/api/stripe/create-teacher-checkout", {
        method: "POST",
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Response data:", data);

        if (data.url) {
          window.location.href = data.url;
        } else {
          console.error("No URL in response");
          alert("Failed to create checkout session: No redirect URL received");
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("API error:", errorData);
        alert(`Failed to create checkout session: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      alert(`Error creating checkout: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleUpdateSubscription = async (priceId: string, planName: string) => {
    try {
      console.log(`Updating subscription to ${planName} with price ID:`, priceId);

      const response = await fetch("/api/stripe/update-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error:", errorData);

        // If no active subscription, guide user to create new one
        if (errorData.action === "create_new") {
          alert(`${errorData.error}\n\nPlease subscribe to a plan first by clicking the upgrade button.`);
        } else {
          alert(`Failed to update subscription: ${errorData.error || "Unknown error"}`);
        }
        return;
      }

      const data = await response.json();
      console.log("Subscription updated successfully:", data);
      alert(`Successfully switched to ${planName}! Your subscription has been updated.`);

      // Refresh the page to show updated plan
      router.refresh();
    } catch (error) {
      console.error("Error updating subscription:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const currentPlanName = isSubscribed
    ? (userRole === "TEACHER" ? "Education" : "Premium Student")
    : "Free";

  const plans = [
    {
      name: "Free",
      price: 0,
      period: "forever",
      description: "Perfect for trying out QuizWhiz",
      icon: Sparkles,
      priceId: null,
      features: [
        "3 quiz uploads",
        "Basic quiz generation",
        "Join classes as student",
        "Standard support"
      ],
      limitations: [
        "Limited AI features",
        "No misconception tracking",
        "No analytics"
      ],
      buttonText: !isSubscribed ? "Current Plan" : "Downgrade to Free",
      buttonDisabled: !isSubscribed, // Only disabled if currently on free plan
      buttonAction: isSubscribed ? () => router.push("/api/stripe/create-portal") : undefined,
      isCurrent: !isSubscribed,
      gradient: "from-gray-500 to-gray-700",
      bgColor: "bg-gray-50 dark:bg-gray-900/50",
      iconBg: "bg-gray-100 dark:bg-gray-800",
      accentColor: "gray"
    },
    {
      name: "Premium Student",
      price: 4.99,
      period: "per month",
      description: "Supercharge your learning journey",
      icon: Zap,
      badge: "Most Popular",
      priceId: PREMIUM_STUDENT_PRICE_ID,
      features: [
        "Unlimited quiz uploads",
        "Advanced AI quiz generation",
        "Misconception tracking",
        "Spaced repetition system",
        "Priority support",
        "Download quiz notes"
      ],
      limitations: [],
      buttonText: (() => {
        if (isSubscribed && userRole === "STUDENT") return "Current Plan";
        if (isSubscribed && userRole === "TEACHER") return "Switch to Student";
        if (!isSubscribed && userRole === "STUDENT") return "Upgrade to Premium";
        return "Switch to Student Plan";
      })(),
      buttonDisabled: isSubscribed && userRole === "STUDENT", // Only disabled if current plan
      buttonAction: (() => {
        if (isSubscribed && userRole === "STUDENT") return undefined; // Current plan
        if (isSubscribed) return () => handleUpdateSubscription(PREMIUM_STUDENT_PRICE_ID, "Premium Student");
        return handleUpgradeStudent; // New subscription
      })(),
      isCurrent: isSubscribed && userRole === "STUDENT",
      gradient: "from-blue-600 via-purple-600 to-pink-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      iconBg: "bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900",
      accentColor: "blue",
      isPopular: true
    },
    {
      name: "Education",
      price: 9.99,
      period: "per month",
      description: "Built for educators and classrooms",
      icon: GraduationCap,
      priceId: EDUCATION_PRICE_ID,
      features: [
        "Everything in Premium",
        "Create unlimited classes",
        "Assign quizzes to students",
        "Class-wide analytics dashboard",
        "Track student progress",
        "Identify misconception patterns",
        "Export detailed reports"
      ],
      limitations: [],
      buttonText: (() => {
        if (isSubscribed && userRole === "TEACHER") return "Current Plan";
        if (isSubscribed && userRole === "STUDENT") return "Switch to Teacher";
        if (!isSubscribed && userRole === "TEACHER") return "Upgrade to Education";
        return "Switch to Teacher Plan";
      })(),
      buttonDisabled: isSubscribed && userRole === "TEACHER", // Only disabled if current plan
      buttonAction: (() => {
        if (isSubscribed && userRole === "TEACHER") return undefined; // Current plan
        if (isSubscribed) return () => handleUpdateSubscription(EDUCATION_PRICE_ID, "Education");
        return handleUpgradeTeacher; // New subscription
      })(),
      isCurrent: isSubscribed && userRole === "TEACHER",
      gradient: "from-green-600 via-emerald-600 to-teal-600",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      iconBg: "bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900",
      accentColor: "green"
    }
  ];

  return (
    <div className="w-full bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" ref={containerRef}>
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full mb-6"
            initial={{ scale: 0.9 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <Crown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">
              Your Plan: {currentPlanName}
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-gray-100 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose the perfect plan for your needs. Upgrade, downgrade, or cancel anytime.
          </p>
        </motion.div>

        {/* Pricing Cards - New Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const isPopular = plan.isPopular;
            const delay = index * 0.1;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 + delay }}
                className="relative"
                onMouseEnter={() => setSelectedPlan(index)}
                onMouseLeave={() => setSelectedPlan(null)}
              >
                {/* Popular Ribbon */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <div className={`bg-gradient-to-r ${plan.gradient} text-white px-6 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold`}>
                      <Star className="w-4 h-4 fill-current" />
                      {plan.badge}
                    </div>
                  </div>
                )}

                {/* Card */}
                <motion.div
                  className={`relative h-full rounded-2xl border-2 transition-all duration-300 ${
                    plan.isCurrent
                      ? 'border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-500/20'
                      : selectedPlan === index
                      ? 'border-gray-300 dark:border-gray-600 shadow-xl'
                      : 'border-gray-200 dark:border-gray-800 shadow-md'
                  } ${plan.bgColor} overflow-hidden`}
                  animate={{
                    y: selectedPlan === index ? -4 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  {/* Current Plan Badge */}
                  {plan.isCurrent && (
                    <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                      Active
                    </div>
                  )}

                  <div className="p-6 lg:p-8">
                    {/* Icon */}
                    <div className={`${plan.iconBg} w-14 h-14 rounded-xl flex items-center justify-center mb-4`}>
                      <Icon className={`w-7 h-7 ${isPopular ? 'text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'}`} />
                    </div>

                    {/* Plan Name */}
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      {plan.description}
                    </p>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black text-gray-900 dark:text-gray-100">
                          ${plan.price}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                          /{plan.period.split(' ')[0]}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {plan.price === 0 ? 'Free forever' : 'Billed monthly • Cancel anytime'}
                      </p>
                    </div>

                    {/* CTA Button */}
                    <Button
                      onClick={plan.buttonAction}
                      disabled={plan.buttonDisabled}
                      className={`w-full mb-6 py-6 text-base font-semibold rounded-xl transition-all duration-300 ${
                        plan.buttonDisabled
                          ? 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                          : isPopular
                          ? `bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white shadow-lg hover:shadow-xl`
                          : 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200'
                      }`}
                    >
                      {plan.buttonText}
                      {!plan.buttonDisabled && <ArrowRight className="w-5 h-5 ml-2 inline" />}
                    </Button>

                    {/* Divider */}
                    <div className="h-px bg-gray-200 dark:bg-gray-800 mb-6" />

                    {/* Features */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                        What&apos;s included
                      </p>
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-5 h-5 rounded-full ${isPopular ? `bg-gradient-to-r ${plan.gradient}` : 'bg-gray-900 dark:bg-gray-100'} flex items-center justify-center mt-0.5`}>
                            <Check className="w-3 h-3 text-white dark:text-gray-900" strokeWidth={3} />
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {feature}
                          </span>
                        </div>
                      ))}

                      {/* Limitations */}
                      {plan.limitations.length > 0 && (
                        <>
                          <div className="pt-3">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                              Limitations
                            </p>
                            {plan.limitations.map((limitation, i) => (
                              <div key={i} className="flex items-start gap-3 mb-2">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mt-0.5">
                                  <X className="w-3 h-3 text-gray-500" strokeWidth={3} />
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-500">
                                  {limitation}
                                </span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Trust Signals */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {[
            { title: "Cancel Anytime", description: "No long-term commitment required" },
            { title: "Secure Payment", description: "All transactions encrypted with Stripe" },
            { title: "7-Day Free Trial", description: "Try premium features risk-free" }
          ].map((item, i) => (
            <div key={i} className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-5 h-5 text-white" strokeWidth={3} />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {item.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.description}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default PricingTable;
