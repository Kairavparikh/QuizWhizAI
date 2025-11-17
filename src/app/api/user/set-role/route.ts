import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const { role } = await req.json();

    if (role !== "STUDENT" && role !== "TEACHER") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Update user role
    await db
      .update(users)
      .set({ role })
      .where(eq(users.id, userId));

    return NextResponse.json({ success: true, role });
  } catch (e: any) {
    console.error("Error setting user role:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
