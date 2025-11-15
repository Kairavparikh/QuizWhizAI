"use server";

import { db } from "@/db";
import { questionResponses, spacedRepetition } from "@/db/schema";
import { auth } from "@/auth";
import { classifyLearningState, type ConfidenceLevel } from "@/lib/confidenceMapping";
import { sql } from "drizzle-orm";

interface SaveQuestionResponseData {
  submissionId: number;
  questionId: number;
  selectedAnswerId: number;
  confidence: ConfidenceLevel;
  isCorrect: boolean;
  questionText: string;
}

export async function saveQuestionResponse(data: SaveQuestionResponseData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    // Classify the learning state
    const learningStateInfo = classifyLearningState(data.isCorrect, data.confidence);

    // Save the question response
    const [response] = await db
      .insert(questionResponses)
      .values({
        submissionId: data.submissionId,
        questionId: data.questionId,
        selectedAnswerId: data.selectedAnswerId,
        confidence: data.confidence,
        isCorrect: data.isCorrect,
        learningState: learningStateInfo.state,
      })
      .returning({ id: questionResponses.id });

    // Update or create spaced repetition entry
    const concept = data.questionText.split(' ').slice(0, 5).join(' '); // Simple concept extraction
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + learningStateInfo.nextReviewDays);

    await db
      .insert(spacedRepetition)
      .values({
        userId,
        questionId: data.questionId,
        concept,
        priority: learningStateInfo.priority,
        nextReviewDate,
        lastReviewDate: new Date(),
        reviewCount: 1,
      })
      .onConflictDoUpdate({
        target: [spacedRepetition.userId, spacedRepetition.questionId],
        set: {
          priority: learningStateInfo.priority,
          nextReviewDate,
          lastReviewDate: new Date(),
          reviewCount: sql`${spacedRepetition.reviewCount} + 1`,
        },
      });

    return { responseId: response.id };
  } catch (error) {
    console.error("Error saving question response:", error);
    throw error;
  }
}

export async function saveAllQuestionResponses(
  submissionId: number,
  responses: Array<{
    questionId: number;
    selectedAnswerId: number;
    confidence: ConfidenceLevel;
    isCorrect: boolean;
    questionText: string;
  }>
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    for (const response of responses) {
      await saveQuestionResponse({
        submissionId,
        ...response,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving all question responses:", error);
    throw error;
  }
}
