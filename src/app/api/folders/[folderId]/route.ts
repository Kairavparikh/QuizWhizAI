import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { folders } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// PATCH update folder
export async function PATCH(
  req: NextRequest,
  { params }: { params: { folderId: string } }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const folderId = parseInt(params.folderId);
    const body = await req.json();
    const { name, description } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
    }

    const [updatedFolder] = await db
      .update(folders)
      .set({
        name: name.trim(),
        description: description?.trim() || null,
      })
      .where(and(eq(folders.id, folderId), eq(folders.userId, userId)))
      .returning();

    if (!updatedFolder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json({ folder: updatedFolder });
  } catch (e: any) {
    console.error("Error updating folder:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE folder
export async function DELETE(
  req: NextRequest,
  { params }: { params: { folderId: string } }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const folderId = parseInt(params.folderId);

    const [deletedFolder] = await db
      .delete(folders)
      .where(and(eq(folders.id, folderId), eq(folders.userId, userId)))
      .returning();

    if (!deletedFolder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Error deleting folder:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
