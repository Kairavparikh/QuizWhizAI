"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface FollowUpResponseProps {
  followUpQuestion: string;
  correctAnswer: string;
  concept: string;
}

export default function FollowUpResponse({
  followUpQuestion,
  correctAnswer,
  concept,
}: FollowUpResponseProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userResponse, setUserResponse] = useState("");
  const [isGrading, setIsGrading] = useState(false);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    explanation: string;
  } | null>(null);

  const handleSubmit = async () => {
    if (!userResponse.trim()) return;

    setIsGrading(true);
    try {
      const response = await fetch("/api/quizz/grade-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: followUpQuestion,
          userResponse: userResponse.trim(),
          correctAnswer,
          concept,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback(data);
      }
    } catch (error) {
      console.error("Error grading response:", error);
    } finally {
      setIsGrading(false);
    }
  };

  if (!followUpQuestion) return null;

  return (
    <div className="mt-4">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          size="sm"
          variant="outline"
          className="text-sm"
        >
          💡 Try Follow-up Question
        </Button>
      ) : (
        <div className="space-y-3 bg-white/50 dark:bg-black/20 rounded-lg p-4 border-l-4 border-current">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-75">
            Follow-up Question
          </p>
          <p className="text-sm font-medium">{followUpQuestion}</p>

          {!feedback ? (
            <div className="space-y-2">
              <textarea
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full min-h-[80px] p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isGrading}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={!userResponse.trim() || isGrading}
                  size="sm"
                  className="flex-1"
                >
                  {isGrading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Grading...
                    </span>
                  ) : (
                    "Submit Answer"
                  )}
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={`p-4 rounded-lg ${
                feedback.isCorrect
                  ? "bg-green-100 dark:bg-green-900/20 border border-green-500"
                  : "bg-orange-100 dark:bg-orange-900/20 border border-orange-500"
              }`}
            >
              <div className="flex items-start gap-2 mb-2">
                <span className="text-2xl">{feedback.isCorrect ? "✅" : "📚"}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    {feedback.isCorrect ? "Correct!" : "Not quite right"}
                  </p>
                  <p className="text-xs opacity-75 mt-1">Your answer: {userResponse}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed">{feedback.explanation}</p>
              <Button
                onClick={() => {
                  setFeedback(null);
                  setUserResponse("");
                }}
                size="sm"
                variant="outline"
                className="mt-3"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
