export type ConfidenceLevel = "low" | "medium" | "high";

export type LearningState =
  | "HIGH_CONFIDENCE_WRONG"
  | "LOW_CONFIDENCE_WRONG"
  | "LOW_CONFIDENCE_CORRECT"
  | "HIGH_CONFIDENCE_CORRECT";

export interface LearningStateInfo {
  state: LearningState;
  interpretation: string;
  color: string;
  priority: number; // 1-5, with 1 being highest priority
  nextReviewDays: number; // Days until next review
  uiColor: string; // Tailwind color class
  icon: string; // Emoji
  message: string; // User-facing message
}

/**
 * Classifies a user's response into one of four learning states
 * based on correctness and confidence level.
 */
export function classifyLearningState(
  isCorrect: boolean,
  confidence: ConfidenceLevel
): LearningStateInfo {
  const isHighConfidence = confidence === "high";
  const isLowConfidence = confidence === "low";
  const isMediumConfidence = confidence === "medium";

  // Wrong answer cases
  if (!isCorrect && isHighConfidence) {
    return {
      state: "HIGH_CONFIDENCE_WRONG",
      interpretation: "Misconception / illusion of mastery",
      color: "red",
      priority: 1, // Highest priority
      nextReviewDays: 1, // Review tomorrow
      uiColor: "bg-red-100 dark:bg-red-900/20 border-red-500",
      icon: "⚠️",
      message: "This is a common misconception. Let's clear this up!",
    };
  }

  if (!isCorrect && (isLowConfidence || isMediumConfidence)) {
    return {
      state: "LOW_CONFIDENCE_WRONG",
      interpretation: "Known weakness",
      color: "orange",
      priority: 2,
      nextReviewDays: 3, // Review in 3 days
      uiColor: "bg-orange-100 dark:bg-orange-900/20 border-orange-500",
      icon: "📚",
      message: "Let's build a stronger foundation on this topic.",
    };
  }

  // Correct answer cases
  if (isCorrect && (isLowConfidence || isMediumConfidence)) {
    return {
      state: "LOW_CONFIDENCE_CORRECT",
      interpretation: "Underconfident mastery",
      color: "yellow",
      priority: 3,
      nextReviewDays: 7, // Review in a week
      uiColor: "bg-yellow-100 dark:bg-yellow-900/20 border-yellow-500",
      icon: "🎯",
      message: "Great job! You know more than you think!",
    };
  }

  // isCorrect && isHighConfidence
  return {
    state: "HIGH_CONFIDENCE_CORRECT",
    interpretation: "True mastery",
    color: "green",
    priority: 5, // Lowest priority
    nextReviewDays: 14, // Review in 2 weeks
    uiColor: "bg-green-100 dark:bg-green-900/20 border-green-500",
    icon: "✅",
    message: "Excellent! You've mastered this concept!",
  };
}

/**
 * Determines the difficulty level for a follow-up question
 * based on the learning state.
 */
export function getFollowUpDifficulty(state: LearningState): string {
  switch (state) {
    case "HIGH_CONFIDENCE_WRONG":
      return "same"; // Same difficulty, different phrasing
    case "LOW_CONFIDENCE_WRONG":
      return "easier"; // Easier, more foundational
    case "LOW_CONFIDENCE_CORRECT":
      return "harder"; // Challenge them
    case "HIGH_CONFIDENCE_CORRECT":
      return "harder"; // Validate mastery
    default:
      return "same";
  }
}

/**
 * Generates a prompt for the AI to create an explanation
 * based on the learning state.
 */
export function generateExplanationPrompt(
  state: LearningState,
  questionText: string,
  correctAnswer: string,
  userAnswer: string
): string {
  const basePrompt = `Question: ${questionText}\nCorrect Answer: ${correctAnswer}\nUser's Answer: ${userAnswer}\n\n`;

  switch (state) {
    case "HIGH_CONFIDENCE_WRONG":
      return (
        basePrompt +
        "The user was confident but incorrect. Generate a corrective explanation that addresses the misconception directly. Be clear about why their answer is wrong and why the correct answer is right. Keep it concise (2-3 sentences)."
      );
    case "LOW_CONFIDENCE_WRONG":
      return (
        basePrompt +
        "The user was unsure and incorrect. Generate a foundational explanation that builds understanding from the basics. Be encouraging and clear. Keep it concise (2-3 sentences)."
      );
    case "LOW_CONFIDENCE_CORRECT":
      return (
        basePrompt +
        "The user got it right but lacked confidence. Generate an encouraging explanation that validates their reasoning and builds confidence. Keep it concise (2-3 sentences)."
      );
    case "HIGH_CONFIDENCE_CORRECT":
      return (
        basePrompt +
        "The user demonstrated mastery. Provide a brief confirmation and perhaps add an interesting related insight. Keep it concise (1-2 sentences)."
      );
    default:
      return basePrompt + "Provide a brief explanation.";
  }
}

/**
 * Generates a prompt for the AI to create a follow-up question
 * based on the learning state.
 */
export function generateFollowUpPrompt(
  state: LearningState,
  questionText: string,
  concept: string
): string {
  const difficulty = getFollowUpDifficulty(state);
  const basePrompt = `Original Question: ${questionText}\nConcept: ${concept}\n\n`;

  switch (state) {
    case "HIGH_CONFIDENCE_WRONG":
      return (
        basePrompt +
        `Generate a follow-up question about the same concept but phrased differently to test true understanding. Difficulty: ${difficulty}. Return only the question text, no additional formatting.`
      );
    case "LOW_CONFIDENCE_WRONG":
      return (
        basePrompt +
        `Generate a simpler, more foundational question about this concept. Difficulty: ${difficulty}. Return only the question text, no additional formatting.`
      );
    case "LOW_CONFIDENCE_CORRECT":
      return (
        basePrompt +
        `Generate a slightly more challenging question about this concept to build confidence. Difficulty: ${difficulty}. Return only the question text, no additional formatting.`
      );
    case "HIGH_CONFIDENCE_CORRECT":
      return (
        basePrompt +
        `Generate an advanced question about this concept to validate mastery. Difficulty: ${difficulty}. Return only the question text, no additional formatting.`
      );
    default:
      return basePrompt + "Generate a follow-up question.";
  }
}
