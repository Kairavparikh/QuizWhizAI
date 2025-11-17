import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { classes, quizAssignments } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// POST - Assign quiz to class
export async function POST(
  req: NextRequest,
  { params }: { params: { classId: string } }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const classId = parseInt(params.classId);
    const { quizId, dueDate, requireConfidence } = await req.json();

    if (!quizId) {
      return NextResponse.json({ error: "Quiz ID is required" }, { status: 400 });
    }

    // Verify the class belongs to this teacher
    const classData = await db.query.classes.findFirst({
      where: eq(classes.id, classId),
    });

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    if (classData.teacherId !== userId) {
      return NextResponse.json({ error: "Only the class teacher can assign quizzes" }, { status: 403 });
    }

    // Create the assignment
    const [assignment] = await db.insert(quizAssignments).values({
      classId,
      quizId: parseInt(quizId),
      dueDate: dueDate ? new Date(dueDate) : null,
      requireConfidence: requireConfidence ?? true,
      status: "active",
    }).returning();

    return NextResponse.json({ assignment, success: true });
  } catch (e: any) {
    console.error("Error assigning quiz:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE - Remove quiz assignment
export async function DELETE(
  req: NextRequest,
  { params }: { params: { classId: string } }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const classId = parseInt(params.classId);
    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get("assignmentId");

    if (!assignmentId) {
      return NextResponse.json({ error: "Assignment ID is required" }, { status: 400 });
    }

    // Verify the class belongs to this teacher
    const classData = await db.query.classes.findFirst({
      where: eq(classes.id, classId),
    });

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    if (classData.teacherId !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete the assignment
    const [deletedAssignment] = await db
      .delete(quizAssignments)
      .where(
        and(
          eq(quizAssignments.id, parseInt(assignmentId)),
          eq(quizAssignments.classId, classId)
        )
      )
      .returning();

    if (!deletedAssignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Error deleting assignment:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
