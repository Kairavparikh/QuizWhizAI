import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { classes, users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Generate random join code
function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing characters
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET - Fetch all classes for a teacher
export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const userClasses = await db.query.classes.findMany({
      where: eq(classes.teacherId, userId),
      with: {
        members: {
          with: {
            student: true,
          },
        },
        assignments: {
          with: {
            quiz: true,
          },
        },
      },
      orderBy: (classes, { desc }) => [desc(classes.createdAt)],
    });

    return NextResponse.json({ classes: userClasses });
  } catch (e: any) {
    console.error("Error fetching classes:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST - Create a new class
export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    // Check if user is a teacher with active subscription
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (user?.role !== "TEACHER") {
      return NextResponse.json({ error: "Only teachers can create classes" }, { status: 403 });
    }

    if (!user?.subscribed) {
      return NextResponse.json({ error: "Active Education Plan subscription required" }, { status: 403 });
    }

    const { name, subject, semester, description } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Class name is required" }, { status: 400 });
    }

    // Generate unique join code
    let joinCode = generateJoinCode();
    let isUnique = false;

    while (!isUnique) {
      const existing = await db.query.classes.findFirst({
        where: eq(classes.joinCode, joinCode),
      });
      if (!existing) {
        isUnique = true;
      } else {
        joinCode = generateJoinCode();
      }
    }

    const [newClass] = await db.insert(classes).values({
      teacherId: userId,
      name,
      subject,
      semester,
      description,
      joinCode,
    }).returning();

    return NextResponse.json({ class: newClass, success: true });
  } catch (e: any) {
    console.error("Error creating class:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
