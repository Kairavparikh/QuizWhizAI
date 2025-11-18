"use server";

import {db} from "@/db";
import { quizzSubmissions, quizzes, users, notifications, quizAssignments } from "@/db/schema";
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
        userId,
    }).returning({insertedId: quizzSubmissions.id});
    const subissionId = newSubmission[0].insertedId;

    try {
        await db
            .update(quizzes)
            .set({ userId })
            .where(isNull(quizzes.userId));

        await db.execute(sql`
            ALTER TABLE "user"
            ADD COLUMN IF NOT EXISTS "free_trials_used" integer DEFAULT 0
        `);

        await db.execute(sql`
            UPDATE "user"
            SET "free_trials_used" = COALESCE("free_trials_used", 0)
            WHERE "id" = ${userId}
        `);

    } catch (error) {
        console.error("Database maintenance error:", error);
    }

    // Send notification that quiz is graded
    try {
        const quiz = await db.query.quizzes.findFirst({
            where: eq(quizzes.id, quizzId),
        });

        if (quiz && score !== null && score !== undefined) {
            // Check if this quiz is part of a class assignment
            const assignment = await db.query.quizAssignments.findFirst({
                where: eq(quizAssignments.quizId, quizzId),
                with: {
                    class: true,
                },
            });

            const scorePercentage = Math.round(score);
            const emoji = scorePercentage >= 90 ? "🎉" : scorePercentage >= 70 ? "👍" : "📝";

            await db.insert(notifications).values({
                userId: userId,
                type: "QUIZ_GRADED",
                title: `Quiz Graded: ${quiz.name || 'Untitled Quiz'}`,
                message: `You scored ${scorePercentage}% ${emoji}`,
                quizId: quizzId,
                classId: assignment?.classId || null,
                assignmentId: assignment?.id || null,
                link: `/results/${quizzId}`,
                read: false,
            });
        }
    } catch (error) {
        console.error("Error sending quiz graded notification:", error);
    }

    return subissionId;
}