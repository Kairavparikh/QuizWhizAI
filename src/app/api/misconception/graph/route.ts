import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { misconceptions, misconceptionRelationships } from "@/db/schema";
import { eq, or } from "drizzle-orm";

interface GraphNode {
  id: number;
  label: string;
  concept: string;
  status: "active" | "resolving" | "resolved";
  strength: number;
  occurrenceCount: number;
  group: string; // For coloring by concept category
}

interface GraphEdge {
  source: number;
  target: number;
  relationshipType: string;
  strength: number;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");
    const includeResolved = searchParams.get("includeResolved") === "true";

    // Get all misconceptions for this user
    let whereClause: any = eq(misconceptions.userId, userId);

    if (folderId) {
      whereClause = eq(misconceptions.folderId, parseInt(folderId));
    }

    const userMisconceptions = await db.query.misconceptions.findMany({
      where: whereClause,
    });

    // Filter out resolved if needed
    const filteredMisconceptions = includeResolved
      ? userMisconceptions
      : userMisconceptions.filter((m) => m.status !== "resolved");

    // Create nodes
    const nodes: GraphNode[] = filteredMisconceptions.map((m) => ({
      id: m.id,
      label: m.misconceptionType,
      concept: m.concept,
      status: m.status,
      strength: m.strength,
      occurrenceCount: m.occurrenceCount,
      group: m.concept, // Group by concept for coloring
    }));

    // Get all relationships between these misconceptions
    const misconceptionIds = nodes.map((n) => n.id);

    const relationships = await db.query.misconceptionRelationships.findMany({
      where: or(
        ...misconceptionIds.flatMap((id) => [
          eq(misconceptionRelationships.misconceptionId1, id),
          eq(misconceptionRelationships.misconceptionId2, id),
        ])
      ),
    });

    // Create edges
    const edges: GraphEdge[] = relationships
      .filter(
        (r) =>
          misconceptionIds.includes(r.misconceptionId1) &&
          misconceptionIds.includes(r.misconceptionId2)
      )
      .map((r) => ({
        source: r.misconceptionId1,
        target: r.misconceptionId2,
        relationshipType: r.relationshipType,
        strength: r.strength,
      }));

    // Auto-detect relationships based on shared concepts
    // This creates implicit edges between misconceptions with related concepts
    const autoEdges: GraphEdge[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];

        // If they share the same concept, create a relationship
        if (node1.concept === node2.concept) {
          // Check if this edge doesn't already exist
          const existsInManual = edges.some(
            (e) =>
              (e.source === node1.id && e.target === node2.id) ||
              (e.source === node2.id && e.target === node1.id)
          );

          const existsInAuto = autoEdges.some(
            (e) =>
              (e.source === node1.id && e.target === node2.id) ||
              (e.source === node2.id && e.target === node1.id)
          );

          if (!existsInManual && !existsInAuto) {
            autoEdges.push({
              source: node1.id,
              target: node2.id,
              relationshipType: "related_concept",
              strength: 3,
            });
          }
        }
      }
    }

    const graphData: GraphData = {
      nodes,
      edges: [...edges, ...autoEdges],
    };

    return NextResponse.json(graphData);
  } catch (e: any) {
    console.error("Error fetching misconception graph:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
