"use server";

import {db} from "@/db";
import { quizzSubmissions, quizzes, users } from "@/db/schema";
import {auth} from "@/auth";
import { InferInsertModel } from "drizzle-orm";
import { eq, isNull } from "drizzle-orm";
import { sql } from "drizzle-orm";

type Submission = InferInsertModel<typeof quizzSubmissions>;

export async function saveSubmission(sub: Submission, quizzId: number){
    const session = await auth();
    const userId = session?.user?.id;
    
    if (!userId) {
        throw new Error("User not authenticated");
    }

    const{score} = sub;
    const newSubmission = await db.insert(quizzSubmissions).values({
        score,
        quizzId,
    }).returning({insertedId: quizzSubmissions.id});
    const subissionId = newSubmission[0].insertedId;

    // Run database maintenance tasks automatically
    try {
        // 1. Update orphaned quizzes (quizzes without userId)
        await db
            .update(quizzes)
            .set({ userId })
            .where(isNull(quizzes.userId));

        // 2. Ensure freeTrialsUsed column exists and set default for new users
        await db.execute(sql`
            ALTER TABLE "user" 
            ADD COLUMN IF NOT EXISTS "free_trials_used" integer DEFAULT 0
        `);

        // 3. Update current user's freeTrialsUsed if they don't have the field
        await db.execute(sql`
            UPDATE "user" 
            SET "free_trials_used" = COALESCE("free_trials_used", 0) 
            WHERE "id" = ${userId}
        `);

    } catch (error) {
        console.error("Database maintenance error:", error);
        // Don't fail the submission if maintenance fails
    }

    return subissionId;
}