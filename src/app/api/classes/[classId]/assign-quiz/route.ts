import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { classes, quizAssignments, classMembers, notifications, quizzes } from "@/db/schema";
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

    // Get quiz details for notification
    const quiz = await db.query.quizzes.findFirst({
      where: eq(quizzes.id, parseInt(quizId)),
    });

    // Get all students in the class
    const members = await db.query.classMembers.findMany({
      where: eq(classMembers.classId, classId),
      with: {
        student: true,
      },
    });

    // Create notifications for all students
    if (members.length > 0 && quiz) {
      const dueDateStr = dueDate
        ? new Date(dueDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        : 'No due date';

      const notificationPromises = members.map((member) =>
        db.insert(notifications).values({
          userId: member.studentId,
          type: "ASSIGNMENT_POSTED",
          title: `New Quiz: ${quiz.name || 'Untitled Quiz'}`,
          message: `Your teacher has assigned a new quiz in ${classData.name}. Due: ${dueDateStr}`,
          classId: classId,
          assignmentId: assignment.id,
          quizId: parseInt(quizId),
          dueDate: dueDate ? new Date(dueDate) : null,
          link: `/student/classes/${classId}/assignments`,
          createdById: userId,
          read: false,
        })
      );

      await Promise.all(notificationPromises);

      // TODO: Send email notifications (will implement with Resend)
      console.log(`Notifications sent to ${members.length} students`);
    }

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
