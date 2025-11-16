import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { misconceptions, questionMisconceptions, misconceptionRelationships } from "@/db/schema";
import { eq, and, or, inArray } from "drizzle-orm";

export async function DELETE(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const misconceptionId = searchParams.get("id");
    const deleteAll = searchParams.get("deleteAll") === "true";

    if (deleteAll) {
      // Delete all misconceptions for this user
      // First, get all misconception IDs for this user
      const userMisconceptions = await db.query.misconceptions.findMany({
        where: eq(misconceptions.userId, userId),
        columns: { id: true },
      });

      if (userMisconceptions.length === 0) {
        return NextResponse.json({ success: true, deletedCount: 0 });
      }

      const misconceptionIds = userMisconceptions.map(m => m.id);

      // Delete related records first
      await db.delete(questionMisconceptions).where(
        inArray(questionMisconceptions.misconceptionId, misconceptionIds)
      );

      await db.delete(misconceptionRelationships).where(
        or(
          inArray(misconceptionRelationships.misconceptionId1, misconceptionIds),
          inArray(misconceptionRelationships.misconceptionId2, misconceptionIds)
        )
      );

      // Delete all misconceptions for this user
      const result = await db
        .delete(misconceptions)
        .where(eq(misconceptions.userId, userId))
        .returning();

      return NextResponse.json({
        success: true,
        deletedCount: result.length,
        message: `Successfully deleted ${result.length} misconception${result.length !== 1 ? 's' : ''}`
      });
    }

    if (!misconceptionId) {
      return NextResponse.json({ error: "Misconception ID is required" }, { status: 400 });
    }

    const id = parseInt(misconceptionId);

    // Verify the misconception belongs to the user
    const misconception = await db.query.misconceptions.findFirst({
      where: and(
        eq(misconceptions.id, id),
        eq(misconceptions.userId, userId)
      ),
    });

    if (!misconception) {
      return NextResponse.json(
        { error: "Misconception not found or you don't have permission to delete it" },
        { status: 404 }
      );
    }

    // Delete related records first to avoid foreign key constraint violations
    // 1. Delete question_misconceptions
    await db.delete(questionMisconceptions).where(
      eq(questionMisconceptions.misconceptionId, id)
    );

    // 2. Delete misconception_relationships
    await db.delete(misconceptionRelationships).where(
      or(
        eq(misconceptionRelationships.misconceptionId1, id),
        eq(misconceptionRelationships.misconceptionId2, id)
      )
    );

    // 3. Now delete the misconception itself
    const result = await db
      .delete(misconceptions)
      .where(eq(misconceptions.id, id))
      .returning();

    return NextResponse.json({ success: true, deleted: result[0] });
  } catch (e: any) {
    console.error("Error deleting misconception:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
