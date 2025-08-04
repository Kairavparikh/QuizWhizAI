"use server";

import { db } from "@/db";
import { sql } from "drizzle-orm";

export default async function migrateFreeTrials() {
  try {
    // Add the freeTrialsUsed column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE "user" 
      ADD COLUMN IF NOT EXISTS "free_trials_used" integer DEFAULT 0
    `);
    
    return { success: true, message: "Migration completed successfully" };
  } catch (error) {
    console.error("Migration error:", error);
    return { error: "Migration failed" };
  }
} 