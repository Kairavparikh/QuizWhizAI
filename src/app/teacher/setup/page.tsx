"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Users, BarChart3, Brain, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function TeacherSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/create-teacher-checkout", {
        method: "POST",
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        console.error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-purple-100 dark:bg-purple-900/30 rounded-full px-4 py-2 mb-4">
            <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm">
              EDUCATION PLAN
            </span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Transform Your Classroom with AI
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Get powerful analytics, class management, and AI-powered teaching insights
          </p>
        </div>

        {/* Pricing Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-purple-200 dark:border-purple-700 p-10 shadow-2xl mb-12">
          <div className="text-center mb-8">
            <div className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              $20
              <span className="text-2xl text-gray-500 dark:text-gray-400">/month</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Everything you need to manage and analyze your classes
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Unlimited Classes
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create and manage as many classes as you need
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Unlimited Students
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No limits on class size or total students
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  AI Quiz Generation
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generate quizzes from any document or topic
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Class Analytics Dashboard
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  See performance, mastery, and trends
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Misconception Tracking
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Identify common mistakes across students
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  AI Teaching Recommendations
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get suggestions on what to review next
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Confidence-Based Learning
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track student confidence vs. correctness
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Learning Path Visualization
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Interactive graphs of class progress
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleSubscribe}
            disabled={loading}
            size="lg"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xl py-8"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 mr-2" />
                Start Your Education Plan
                <ArrowRight className="w-6 h-6 ml-2" />
              </>
            )}
          </Button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Cancel anytime. No long-term contracts.
          </p>
        </div>

        {/* Why Teachers Love It */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">
              Save Time
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              AI generates quizzes in seconds. No more manual question writing.
            </p>
          </div>

          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">
              Deeper Insights
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              See misconceptions, not just scores. Know exactly what to reteach.
            </p>
          </div>

          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">
              Better Outcomes
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Students learn faster with adaptive, confidence-based learning.
            </p>
          </div>
        </div>

        {/* Skip Option */}
        <div className="text-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
          >
            Skip for now (explore as a student first)
          </button>
        </div>
      </div>
    </div>
  );
}
