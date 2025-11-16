import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { misconceptions, misconceptionPatterns, folders } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");
    const status = searchParams.get("status"); // 'active', 'resolving', 'resolved'

    // Build where clause
    let whereClause: any = eq(misconceptions.userId, userId);

    if (folderId) {
      whereClause = and(whereClause, eq(misconceptions.folderId, parseInt(folderId)));
    }

    if (status) {
      whereClause = and(whereClause, eq(misconceptions.status, status as any));
    }

    // Get all misconceptions for this user
    const userMisconceptions = await db.query.misconceptions.findMany({
      where: whereClause,
      orderBy: [desc(misconceptions.strength), desc(misconceptions.occurrenceCount)],
      with: {
        folder: true,
      },
    });

    // Get cognitive error patterns
    const patterns = await db.query.misconceptionPatterns.findMany({
      where: eq(misconceptionPatterns.userId, userId),
      orderBy: [desc(misconceptionPatterns.occurrenceCount)],
    });

    // Group misconceptions by status
    const grouped = {
      active: userMisconceptions.filter((m) => m.status === "active"),
      resolving: userMisconceptions.filter((m) => m.status === "resolving"),
      resolved: userMisconceptions.filter((m) => m.status === "resolved"),
    };

    // Calculate statistics
    const stats = {
      total: userMisconceptions.length,
      active: grouped.active.length,
      resolving: grouped.resolving.length,
      resolved: grouped.resolved.length,
      topPatterns: patterns.slice(0, 5),
      averageStrength:
        userMisconceptions.reduce((sum, m) => sum + m.strength, 0) /
        (userMisconceptions.length || 1),
    };

    return NextResponse.json({
      misconceptions: userMisconceptions,
      grouped,
      patterns,
      stats,
    });
  } catch (e: any) {
    console.error("Error fetching misconception profile:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
