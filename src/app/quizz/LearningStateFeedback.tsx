"use client";

import { useState, useEffect } from "react";
import { classifyLearningState, type ConfidenceLevel } from "@/lib/confidenceMapping";
import FollowUpResponse from "./FollowUpResponse";

interface LearningStateFeedbackProps {
  isCorrect: boolean;
  confidence: ConfidenceLevel;
  questionText: string;
  correctAnswer: string;
  userAnswer: string;
  concept?: string;
  isVisible: boolean;
  showFollowUp?: boolean; // New prop to control follow-up display
}

export default function LearningStateFeedback({
  isCorrect,
  confidence,
  questionText,
  correctAnswer,
  userAnswer,
  concept = "this topic",
  isVisible,
  showFollowUp = true,
}: LearningStateFeedbackProps) {
  const [explanation, setExplanation] = useState<string>("");
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const learningStateInfo = classifyLearningState(isCorrect, confidence);

  useEffect(() => {
    if (!isVisible) return;

    const fetchExplanation = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/quizz/generate-explanation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            learningState: learningStateInfo.state,
            questionText,
            correctAnswer,
            userAnswer,
            concept,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setExplanation(data.explanation);
          setFollowUpQuestion(data.followUpQuestion);
        }
      } catch (error) {
        console.error("Error fetching explanation:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExplanation();
  }, [isVisible, learningStateInfo.state, questionText, correctAnswer, userAnswer, concept]);

  if (!isVisible) return null;

  return (
    <div className={`rounded-xl border-2 p-6 mt-4 ${learningStateInfo.uiColor}`}>
      <div className="flex items-start gap-3">
        <span className="text-4xl">{learningStateInfo.icon}</span>
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-bold text-lg">{learningStateInfo.message}</h3>
            <p className="text-sm opacity-75 mt-1">{learningStateInfo.interpretation}</p>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              <p className="text-sm">Generating personalized feedback...</p>
            </div>
          ) : (
            <>
              {explanation && (
                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
                  <p className="text-sm leading-relaxed">{explanation}</p>
                </div>
              )}

              {showFollowUp && followUpQuestion && (
                <FollowUpResponse
                  followUpQuestion={followUpQuestion}
                  correctAnswer={correctAnswer}
                  concept={concept}
                />
              )}
            </>
          )}

          <div className="flex items-center gap-4 text-xs opacity-75 pt-2 border-t border-current/20">
            <span>Priority: {learningStateInfo.priority}/5</span>
            <span>Next Review: {learningStateInfo.nextReviewDays} days</span>
          </div>
        </div>
      </div>
    </div>
  );
}
