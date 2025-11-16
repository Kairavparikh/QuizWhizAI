import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { folders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET all folders for user
export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const userFolders = await db.query.folders.findMany({
      where: eq(folders.userId, userId),
      orderBy: [desc(folders.createdAt)],
    });

    return NextResponse.json({ folders: userFolders });
  } catch (e: any) {
    console.error("Error fetching folders:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST create new folder
export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
    }

    const [newFolder] = await db
      .insert(folders)
      .values({
        name: name.trim(),
        description: description?.trim() || null,
        userId,
      })
      .returning();

    return NextResponse.json({ folder: newFolder }, { status: 201 });
  } catch (e: any) {
    console.error("Error creating folder:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
