import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { quizzes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = 'force-dynamic';

// GET - Fetch all quizzes for the current user
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch all quizzes for this user
        const userQuizzes = await db.query.quizzes.findMany({
            where: eq(quizzes.userId, userId),
            with: {
                questions: {
                    with: {
                        answers: true,
                    },
                },
            },
            orderBy: [desc(quizzes.createdAt)],
        });

        return NextResponse.json({ quizzes: userQuizzes });
    } catch (error: any) {
        console.error("Error fetching quizzes:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch quizzes" }, { status: 500 });
    }
}
