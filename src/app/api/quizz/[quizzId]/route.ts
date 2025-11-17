import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import {
    quizzes,
    questions,
    questionsAnswers,
    quizzSubmissions,
    questionResponses,
    aiExplanations,
    followUpQuestions,
    spacedRepetition,
    questionMisconceptions,
} from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";

// GET - Fetch quiz details
export async function GET(
    request: NextRequest,
    { params }: { params: { quizzId: string } }
) {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const quizzId = parseInt(params.quizzId);

        // Fetch quiz with questions and answers
        const quiz = await db.query.quizzes.findFirst({
            where: eq(quizzes.id, quizzId),
            with: {
                questions: {
                    with: {
                        answers: true,
                    },
                },
            },
        });

        if (!quiz) {
            return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
        }

        // Check if user has access to this quiz
        if (quiz.userId !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        return NextResponse.json(quiz);
    } catch (error: any) {
        console.error("Error fetching quiz:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch quiz" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { quizzId: string } }
) {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const quizzId = parseInt(params.quizzId);

        // Verify the quiz belongs to the user
        const quiz = await db.query.quizzes.findFirst({
            where: eq(quizzes.id, quizzId),
        });

        if (!quiz) {
            return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
        }

        if (quiz.userId !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Get all questions for this quiz
        const quizQuestions = await db.query.questions.findMany({
            where: eq(questions.quizzId, quizzId),
        });

        const questionIds = quizQuestions.map((q) => q.id);

        if (questionIds.length > 0) {
            // Get all submissions for this quiz
            const submissions = await db.query.quizzSubmissions.findMany({
                where: eq(quizzSubmissions.quizzId, quizzId),
            });

            const submissionIds = submissions.map((s) => s.id);

            if (submissionIds.length > 0) {
                // Get all question responses for these submissions
                const responses = await db.query.questionResponses.findMany({
                    where: inArray(questionResponses.submissionId, submissionIds),
                });

                const responseIds = responses.map((r) => r.id);

                if (responseIds.length > 0) {
                    // Delete AI explanations
                    await db.delete(aiExplanations).where(inArray(aiExplanations.responseId, responseIds));

                    // Delete follow-up questions
                    await db.delete(followUpQuestions).where(inArray(followUpQuestions.originalResponseId, responseIds));
                }

                // Delete question responses
                await db.delete(questionResponses).where(inArray(questionResponses.submissionId, submissionIds));
            }

            // Delete quiz submissions
            await db.delete(quizzSubmissions).where(eq(quizzSubmissions.quizzId, quizzId));

            // Delete spaced repetition entries for these questions
            await db.delete(spacedRepetition).where(inArray(spacedRepetition.questionId, questionIds));

            // Delete question-misconception links
            await db.delete(questionMisconceptions).where(inArray(questionMisconceptions.questionId, questionIds));

            // Delete answers for each question
            for (const question of quizQuestions) {
                await db.delete(questionsAnswers).where(eq(questionsAnswers.questionId, question.id));
            }

            // Delete all questions
            await db.delete(questions).where(eq(questions.quizzId, quizzId));
        }

        // Delete the quiz
        await db.delete(quizzes).where(eq(quizzes.id, quizzId));

        return NextResponse.json({ success: true, message: "Quiz deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting quiz:", error);
        return NextResponse.json({ error: error.message || "Failed to delete quiz" }, { status: 500 });
    }
}
