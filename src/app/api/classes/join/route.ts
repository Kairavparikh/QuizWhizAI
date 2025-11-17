import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { classes, classMembers, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// POST - Join a class with a code
export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    // Check if user is a teacher
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (user?.role === "TEACHER") {
      return NextResponse.json({
        error: "Teachers cannot join classes. You can create classes from your teacher dashboard."
      }, { status: 403 });
    }

    const { joinCode } = await req.json();

    if (!joinCode) {
      return NextResponse.json({ error: "Join code is required" }, { status: 400 });
    }

    // Find class by join code
    const classData = await db.query.classes.findFirst({
      where: eq(classes.joinCode, joinCode.toUpperCase()),
    });

    if (!classData) {
      return NextResponse.json({ error: "Invalid join code" }, { status: 404 });
    }

    // Check if already a member
    const existingMember = await db.query.classMembers.findFirst({
      where: and(
        eq(classMembers.classId, classData.id),
        eq(classMembers.studentId, userId)
      ),
    });

    if (existingMember) {
      return NextResponse.json({ error: "Already a member of this class" }, { status: 400 });
    }

    // Add student to class
    const [newMember] = await db.insert(classMembers).values({
      classId: classData.id,
      studentId: userId,
    }).returning();

    return NextResponse.json({
      success: true,
      class: classData,
      member: newMember
    });
  } catch (e: any) {
    console.error("Error joining class:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
