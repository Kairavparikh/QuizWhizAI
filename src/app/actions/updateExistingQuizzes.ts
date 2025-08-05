"use server";

import { db } from "@/db";
import { quizzes } from "@/db/schema";
import { auth } from "@/auth";
import { isNull } from "drizzle-orm";

export default async function updateExistingQuizzes() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return;
  }

  try {
    await db
      .update(quizzes)
      .set({ userId })
      .where(isNull(quizzes.userId));
  } catch (error) {
    console.error("Error updating existing quizzes:", error);
  }
} 