"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Users, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function RoleSelectionPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    // If not authenticated, redirect to sign in
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }

    // If authenticated and already has a role, redirect to appropriate dashboard
    if (status === "authenticated" && session?.user) {
      const userRole = (session.user as any)?.role;
      // Only redirect if user has a role (not null/undefined)
      if (userRole) {
        if (userRole === "TEACHER") {
          router.push("/teacher/dashboard");
        } else if (userRole === "STUDENT") {
          router.push("/dashboard");
        }
      }
      // If userRole is null/undefined, stay on role selection page
    }
  }, [status, session, router]);

  const handleRoleSelection = async (role: "STUDENT" | "TEACHER") => {
    if (status !== "authenticated") {
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch("/api/user/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (response.ok) {
        const { role: selectedRole } = await response.json();

        if (selectedRole === "TEACHER") {
          // Check if user is already subscribed
          const userResponse = await fetch("/api/user/profile");
          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData.user?.subscribed) {
              // Already subscribed, go to dashboard
              router.push("/teacher/dashboard");
            } else {
              // Not subscribed, go to setup/payment
              router.push("/teacher/setup");
            }
          } else {
            // Default to setup if we can't fetch user data
            router.push("/teacher/setup");
          }
        } else {
          // Students go to main dashboard
          router.push("/dashboard");
        }
      } else {
        console.error("Failed to set role");
      }
    } catch (error) {
      console.error("Error setting role:", error);
    } finally {
      setUpdating(false);
    }
  };

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Welcome to QuizWhiz AI! 🎓
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Choose how you want to use QuizWhiz
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Student Option */}
          <div
            onClick={() => !updating && handleRoleSelection("STUDENT")}
            className="group relative bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-3xl border-2 border-green-200 dark:border-green-700 p-10 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="p-6 bg-green-100 dark:bg-green-900/40 rounded-full">
                <BookOpen className="w-16 h-16 text-green-600 dark:text-green-400" />
              </div>

              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                I&apos;m a Student
              </h2>

              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Learn smarter with AI-powered quizzes and personalized misconception tracking
              </p>

              <ul className="text-left w-full space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span>Take notes with live speech-to-text</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span>Upload PDFs and get instant quizzes</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span>Join classes and complete assignments</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span>Track misconceptions and learning gaps</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span>Adaptive learning with spaced repetition</span>
                </li>
              </ul>

              <Button
                size="lg"
                disabled={updating}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white text-lg py-6 group-hover:gap-4 transition-all"
              >
                <BookOpen className="w-6 h-6 mr-2" />
                {updating ? "Setting up..." : "Continue as Student"}
              </Button>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                Free to get started
              </div>
            </div>
          </div>

          {/* Teacher Option */}
          <div
            onClick={() => !updating && handleRoleSelection("TEACHER")}
            className="group relative bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-3xl border-2 border-purple-200 dark:border-purple-700 p-10 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="p-6 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                <GraduationCap className="w-16 h-16 text-purple-600 dark:text-purple-400" />
              </div>

              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                I&apos;m a Teacher
              </h2>

              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Manage classes, assign quizzes, and get AI-powered insights on student performance
              </p>

              <ul className="text-left w-full space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <span>Create and manage unlimited classes</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <span>Generate AI quizzes from your materials</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <span>View class-wide analytics and patterns</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <span>Identify misconceptions across students</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <span>Get AI teaching recommendations</span>
                </li>
              </ul>

              <Button
                size="lg"
                disabled={updating}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg py-6 group-hover:gap-4 transition-all"
              >
                <GraduationCap className="w-6 h-6 mr-2" />
                {updating ? "Setting up..." : "Continue as Teacher"}
              </Button>

              <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                $9.99/month Education Plan
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            You can change your role anytime in settings
          </p>
        </div>
      </div>
    </div>
  );
}
