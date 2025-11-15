import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { spacedRepetition, questions, questionsAnswers } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and, lte } from "drizzle-orm";

/**
 * GET endpoint to fetch spaced repetition items due for review
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Fetch all spaced repetition items due for review, ordered by priority
    const reviewItems = await db.query.spacedRepetition.findMany({
      where: and(
        eq(spacedRepetition.userId, userId),
        lte(spacedRepetition.nextReviewDate, now)
      ),
      orderBy: (spacedRepetition, { asc }) => [asc(spacedRepetition.priority)],
      with: {
        question: {
          with: {
            answers: true,
          },
        },
      },
      limit: 20, // Limit to 20 items per review session
    });

    return NextResponse.json(
      {
        reviewItems,
        totalDue: reviewItems.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching spaced repetition items:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST endpoint to update a spaced repetition item after review
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { itemId, newPriority, nextReviewDays } = body;

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + nextReviewDays);

    await db
      .update(spacedRepetition)
      .set({
        priority: newPriority,
        nextReviewDate,
        lastReviewDate: new Date(),
      })
      .where(
        and(
          eq(spacedRepetition.id, itemId),
          eq(spacedRepetition.userId, userId)
        )
      );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating spaced repetition item:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
