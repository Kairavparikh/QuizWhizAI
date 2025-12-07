import { auth } from "@/auth";
import { db } from "@/db";
import { quizAssignments, classes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "TEACHER") {
      return NextResponse.json({ error: "Only teachers can assign quizzes" }, { status: 403 });
    }

    const body = await request.json();
    const { quizId, classId } = body;

    if (!quizId || !classId) {
      return NextResponse.json({ error: "Quiz ID and Class ID are required" }, { status: 400 });
    }

    // Verify the class belongs to this teacher
    const classData = await db.query.classes.findFirst({
      where: eq(classes.id, classId),
    });

    if (!classData || classData.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Class not found or access denied" }, { status: 403 });
    }

    // Create the assignment
    const assignment = await db.insert(quizAssignments).values({
      classId,
      quizId,
    }).returning();

    return NextResponse.json({ success: true, assignment: assignment[0] });
  } catch (error) {
    console.error("Error assigning quiz:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
