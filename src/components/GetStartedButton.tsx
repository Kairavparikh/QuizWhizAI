"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface GetStartedButtonProps {
  isAuthenticated: boolean;
  userRole: string | null;
}

export default function GetStartedButton({ isAuthenticated, userRole }: GetStartedButtonProps) {
  const router = useRouter();

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      // User is not logged in, redirect to sign in with Google
      router.push("/api/auth/signin");
    } else if (!userRole) {
      // User is logged in but hasn't selected a role
      router.push("/role-selection");
    } else if (userRole === "TEACHER") {
      // Teacher goes to teacher dashboard
      router.push("/teacher/dashboard");
    } else {
      // Student goes to student dashboard
      router.push("/dashboard");
    }
  };

  return (
    <Button
      variant="neo"
      className="mt-4 h-14 text-white"
      onClick={handleGetStarted}
    >
      Get Started
    </Button>
  );
}
