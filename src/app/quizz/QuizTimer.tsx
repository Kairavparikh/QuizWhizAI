"use client";

import { useEffect } from "react";
import { Clock } from "lucide-react";

interface QuizTimerProps {
  timeLeftInSeconds: number;
  onTick: (newTime: number) => void;
  onExpire: () => void;
}

export default function QuizTimer({ timeLeftInSeconds, onTick, onExpire }: QuizTimerProps) {
  useEffect(() => {
    if (timeLeftInSeconds <= 0) {
      onExpire();
      return;
    }

    const timer = setInterval(() => {
      const newTime = timeLeftInSeconds - 1;
      onTick(newTime);

      if (newTime <= 0) {
        onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeftInSeconds, onTick, onExpire]);

  const minutes = Math.floor(timeLeftInSeconds / 60);
  const seconds = timeLeftInSeconds % 60;

  // Color coding based on time remaining
  const getColorClass = () => {
    if (timeLeftInSeconds > 120) return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 border-green-500";
    if (timeLeftInSeconds > 60) return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20 border-yellow-500";
    return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 border-red-500 animate-pulse";
  };

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-mono text-lg font-bold transition-all ${getColorClass()}`}>
      <Clock className="w-5 h-5" />
      <span>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}
