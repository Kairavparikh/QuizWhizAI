import { db } from "@/db";
import { quizzSubmissions, questions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: { quizzId: string } }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const quizzId = parseInt(params.quizzId);

        // Get the latest submission for this quiz
        const latestSubmission = await db.query.quizzSubmissions.findFirst({
            where: eq(quizzSubmissions.quizzId, quizzId),
            orderBy: [desc(quizzSubmissions.createdAt)],
            with: {
                questionResponses: {
                    with: {
                        question: {
                            with: {
                                answers: true
                            }
                        },
                        selectedAnswer: true
                    }
                }
            }
        });

        if (!latestSubmission) {
            return NextResponse.json({ error: "No submissions found" }, { status: 404 });
        }

        return NextResponse.json({
            submission: latestSubmission
        });
    } catch (error) {
        console.error("Error fetching latest submission:", error);
        return NextResponse.json({ error: "Failed to fetch submission" }, { status: 500 });
    }
}
