"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";

const FREE_TRIAL_LIMIT = 3;

export async function checkFreeTrials() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { error: "User not authenticated" };
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return { error: "User not found" };
    }

    if (user.subscribed) {
      return { canUpload: true, trialsUsed: 0, trialsRemaining: Infinity };
    }

    const trialsUsed = user.freeTrialsUsed || 0;
    const trialsRemaining = FREE_TRIAL_LIMIT - trialsUsed;
    const canUpload = trialsRemaining > 0;

    return {
      canUpload,
      trialsUsed,
      trialsRemaining,
      limit: FREE_TRIAL_LIMIT,
    };
  } catch (error) {
    console.error("Error checking free trials:", error);
    return { error: "Failed to check free trials" };
  }
}

export async function incrementFreeTrials() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { error: "User not authenticated" };
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return { error: "User not found" };
    }

    if (user.subscribed) {
      return { success: true };
    }

    const currentTrials = user.freeTrialsUsed || 0;
    
    if (currentTrials >= FREE_TRIAL_LIMIT) {
      return { error: "Free trial limit exceeded" };
    }

    await db
      .update(users)
      .set({ freeTrialsUsed: currentTrials + 1 })
      .where(eq(users.id, userId));

    return { success: true, trialsUsed: currentTrials + 1 };
  } catch (error) {
    console.error("Error incrementing free trials:", error);
    return { error: "Failed to increment free trials" };
  }
} 