"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface GetStartedButtonProps {
  isAuthenticated: boolean;
}

export default function GetStartedButton({ isAuthenticated }: GetStartedButtonProps) {
  const router = useRouter();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      // User is logged in, go to create quiz page
      router.push("/quizz/new");
    } else {
      // User is not logged in, redirect to sign in with Google
      router.push("/api/auth/signin");
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
