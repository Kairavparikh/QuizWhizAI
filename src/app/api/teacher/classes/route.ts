import { auth } from "@/auth";
import { db } from "@/db";
import { classes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "TEACHER") {
      return NextResponse.json({ error: "Only teachers can access this endpoint" }, { status: 403 });
    }

    const teacherClasses = await db.query.classes.findMany({
      where: eq(classes.teacherId, session.user.id),
      orderBy: (classes, { desc }) => [desc(classes.createdAt)],
    });

    return NextResponse.json({ classes: teacherClasses });
  } catch (error) {
    console.error("Error fetching teacher classes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
