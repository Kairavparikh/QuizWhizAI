"use server";

import {db} from "@/db";
import { quizzSubmissions, quizzes, users, notifications, quizAssignments, questions, questionMisconceptions, misconceptions } from "@/db/schema";
import {auth} from "@/auth";
import { InferInsertModel } from "drizzle-orm";
import { eq, isNull, and, inArray } from "drizzle-orm";
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

    // Check if this is an adaptive quiz and if score >= 75%, resolve misconceptions
    try {
        if (score !== null && score !== undefined && score >= 75) {
            // Get all questions for this quiz
            const quizQuestions = await db.query.questions.findMany({
                where: eq(questions.quizzId, quizzId),
            });

            if (quizQuestions.length > 0) {
                const questionIds = quizQuestions.map(q => q.id);

                // Find all misconceptions linked to these questions
                const linkedMisconceptions = await db.query.questionMisconceptions.findMany({
                    where: inArray(questionMisconceptions.questionId, questionIds),
                    with: {
                        misconception: true,
                    },
                });

                // Extract unique misconception IDs that belong to this user
                const misconceptionIds = new Set<number>();
                for (const link of linkedMisconceptions) {
                    if (link.misconception.userId === userId) {
                        misconceptionIds.add(link.misconception.id);
                    }
                }

                // If we found misconceptions, mark them as resolved
                if (misconceptionIds.size > 0) {
                    const idsArray = Array.from(misconceptionIds);

                    await db
                        .update(misconceptions)
                        .set({
                            status: "resolved",
                            resolvedAt: new Date(),
                            lastTestedAt: new Date(),
                        })
                        .where(
                            and(
                                inArray(misconceptions.id, idsArray),
                                eq(misconceptions.userId, userId)
                            )
                        );

                    console.log(`Resolved ${misconceptionIds.size} misconception(s) for user ${userId} after scoring ${score}% on quiz ${quizzId}`);
                }
            }
        }
    } catch (error) {
        console.error("Error resolving misconceptions on high score:", error);
    }

    return subissionId;
}