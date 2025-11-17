import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { classes } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET - Fetch single class details
export async function GET(
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

    const classData = await db.query.classes.findFirst({
      where: eq(classes.id, classId),
      with: {
        teacher: true,
        members: {
          with: {
            student: true,
          },
        },
        assignments: {
          with: {
            quiz: {
              with: {
                questions: true,
              },
            },
          },
        },
      },
    });

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Check if user is the teacher or a member
    const isMember = classData.members.some(m => m.studentId === userId);
    if (classData.teacherId !== userId && !isMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ class: classData });
  } catch (e: any) {
    console.error("Error fetching class:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PATCH - Update class details
export async function PATCH(
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
    const { name, subject, semester, description } = await req.json();

    const [updatedClass] = await db
      .update(classes)
      .set({ name, subject, semester, description })
      .where(and(eq(classes.id, classId), eq(classes.teacherId, userId)))
      .returning();

    if (!updatedClass) {
      return NextResponse.json({ error: "Class not found or access denied" }, { status: 404 });
    }

    return NextResponse.json({ class: updatedClass, success: true });
  } catch (e: any) {
    console.error("Error updating class:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE - Delete class
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

    const [deletedClass] = await db
      .delete(classes)
      .where(and(eq(classes.id, classId), eq(classes.teacherId, userId)))
      .returning();

    if (!deletedClass) {
      return NextResponse.json({ error: "Class not found or access denied" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Error deleting class:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
