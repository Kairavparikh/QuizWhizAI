import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    // Mark all user's notifications as read
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
