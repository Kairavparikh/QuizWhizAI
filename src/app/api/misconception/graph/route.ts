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

    // Helper function to extract generic category from concept
    const extractGenericCategory = (concept: string): string => {
      // Common generic categories to force separation
      const categoryKeywords: { [key: string]: string } = {
        // Programming concepts
        'function': 'Functions & Methods',
        'method': 'Functions & Methods',
        'class': 'Classes & Objects',
        'object': 'Classes & Objects',
        'variable': 'Variables & Data',
        'data': 'Variables & Data',
        'array': 'Data Structures',
        'list': 'Data Structures',
        'structure': 'Data Structures',
        'algorithm': 'Algorithms',
        'loop': 'Control Flow',
        'condition': 'Control Flow',
        'if': 'Control Flow',
        'while': 'Control Flow',
        // General concepts
        'analysis': 'Analysis & Evaluation',
        'design': 'Design & Architecture',
        'architecture': 'Design & Architecture',
        'pattern': 'Design Patterns',
        'test': 'Testing & QA',
        'debug': 'Testing & QA',
        'optimization': 'Performance',
        'performance': 'Performance',
        'security': 'Security',
        'database': 'Databases',
        'query': 'Databases',
        'network': 'Networking',
        'api': 'APIs & Integration',
        'interface': 'APIs & Integration',
        'ui': 'User Interface',
        'ux': 'User Experience',
      };

      const lowerConcept = concept.toLowerCase();

      // Check for keyword matches
      for (const [keyword, category] of Object.entries(categoryKeywords)) {
        if (lowerConcept.includes(keyword)) {
          return category;
        }
      }

      // Fallback: use first significant word
      const words = concept.split(/[\s,\-_:;\/]+/).filter(w => w.length > 3);
      return words.length > 0 ? words[0].charAt(0).toUpperCase() + words[0].slice(1) : 'Miscellaneous';
    };

    // Re-assign nodes to generic categories to force separation
    const categorizedNodes = nodes.map(node => ({
      ...node,
      group: extractGenericCategory(node.concept),
    }));

    // Auto-detect relationships based on group and concept similarity
    // Connect nodes that are in the same group OR share exact concept
    const autoEdges: GraphEdge[] = [];

    for (let i = 0; i < categorizedNodes.length; i++) {
      for (let j = i + 1; j < categorizedNodes.length; j++) {
        const node1 = categorizedNodes[i];
        const node2 = categorizedNodes[j];

        // Connect if they share the same generic category OR exact same concept
        const sameGroup = node1.group === node2.group;
        const exactConceptMatch = node1.concept.toLowerCase() === node2.concept.toLowerCase();

        if (sameGroup || exactConceptMatch) {
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
              relationshipType: exactConceptMatch ? "same_concept" : "same_category",
              strength: exactConceptMatch ? 5 : 3,
            });
          }
        }
      }
    }

    const graphData: GraphData = {
      nodes: categorizedNodes,
      edges: [...edges, ...autoEdges],
    };

    return NextResponse.json(graphData);
  } catch (e: any) {
    console.error("Error fetching misconception graph:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
