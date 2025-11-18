import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const notificationId = parseInt(params.id);

    // Verify the notification belongs to the user
    const notification = await db.query.notifications.findFirst({
      where: and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      ),
    });

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    // Delete the notification
    await db
      .delete(notifications)
      .where(eq(notifications.id, notificationId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting notification:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
