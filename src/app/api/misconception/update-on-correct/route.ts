import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { misconceptions, questionMisconceptions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

interface UpdateOnCorrectRequest {
    questionId: number;
    confidence: "low" | "medium" | "high";
}

export async function POST(req: NextRequest) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    try {
        const body: UpdateOnCorrectRequest = await req.json();
        const { questionId, confidence } = body;

        // Only process high-confidence correct answers
        if (confidence !== "high") {
            return NextResponse.json({ message: "Skipping non-high-confidence answer" });
        }

        // Find misconceptions linked to this question
        const linkedMisconceptions = await db.query.questionMisconceptions.findMany({
            where: eq(questionMisconceptions.questionId, questionId),
            with: {
                misconception: true,
            },
        });

        if (linkedMisconceptions.length === 0) {
            return NextResponse.json({ message: "No linked misconceptions found" });
        }

        // Update each linked misconception
        const updates = [];
        for (const link of linkedMisconceptions) {
            const misconception = link.misconception;

            // Skip if not owned by this user
            if (misconception.userId !== userId) {
                continue;
            }

            const newCorrectStreak = misconception.correctStreakCount + 1;
            const newStrength = Math.max(1, misconception.strength - 1); // Decrease strength, min 1

            // Determine new status based on correct streak
            let newStatus = misconception.status;
            if (newCorrectStreak >= 5) {
                newStatus = "resolved";
            } else if (newCorrectStreak >= 3) {
                newStatus = "resolving";
            }

            const updateData: any = {
                correctStreakCount: newCorrectStreak,
                strength: newStrength,
                status: newStatus,
                lastTestedAt: new Date(),
            };

            // If resolved, set resolvedAt timestamp
            if (newStatus === "resolved" && misconception.status !== "resolved") {
                updateData.resolvedAt = new Date();
            }

            await db
                .update(misconceptions)
                .set(updateData)
                .where(
                    and(
                        eq(misconceptions.id, misconception.id),
                        eq(misconceptions.userId, userId)
                    )
                );

            updates.push({
                misconceptionId: misconception.id,
                concept: misconception.concept,
                oldStatus: misconception.status,
                newStatus: newStatus,
                correctStreak: newCorrectStreak,
            });
        }

        return NextResponse.json({
            message: "Misconceptions updated",
            updates,
        });
    } catch (error: any) {
        console.error("Error updating misconceptions on correct answer:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
