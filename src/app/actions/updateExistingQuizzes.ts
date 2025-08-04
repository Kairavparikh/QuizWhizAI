"use server";

import { db } from "@/db";
import { quizzes } from "@/db/schema";
import { auth } from "@/auth";
import { isNull } from "drizzle-orm";

export default async function updateExistingQuizzes() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { error: "User not authenticated" };
  }

  try {
    // Update quizzes that don't have a userId
    const result = await db
      .update(quizzes)
      .set({ userId })
      .where(isNull(quizzes.userId))
      .returning({ id: quizzes.id });

    return { 
      success: true, 
      updatedCount: result.length,
      updatedQuizzes: result 
    };
  } catch (error) {
    console.error("Error updating existing quizzes:", error);
    return { error: "Failed to update existing quizzes" };
  }
} 