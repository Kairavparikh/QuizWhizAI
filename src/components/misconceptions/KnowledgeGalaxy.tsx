'use client';

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

// Dynamically import ForceGraph2D with no SSR
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

interface GraphNode {
  id: number;
  label: string;
  concept: string;
  status: "active" | "resolving" | "resolved";
  strength: number;
  occurrenceCount: number;
  group: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface GraphLink {
  source: number | GraphNode;
  target: number | GraphNode;
  type: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphLink[];
}

interface KnowledgeGalaxyProps {
  data: GraphData;
  onNodeClick: (node: GraphNode) => void;
  width?: number;
  height?: number;
}

export default function KnowledgeGalaxy({
  data,
  onNodeClick,
  width,
  height,
}: KnowledgeGalaxyProps) {
  const fgRef = useRef<any>();
  const { theme, systemTheme } = useTheme();
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[], links: GraphLink[] }>({ nodes: [], links: [] });

  // Determine if we're in dark mode
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';

  useEffect(() => {
    // Process data to ensure it's in the right format for force-graph
    // We create a deep copy to avoid mutating props
    // force-graph expects 'links' not 'edges'
    if (data && data.nodes && data.edges) {
      setGraphData({
        nodes: data.nodes.map(n => ({ ...n })),
        links: data.edges.map(e => ({ ...e }))
      });
    } else {
      setGraphData({ nodes: [], links: [] });
    }
  }, [data]);

  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const graphNode = node as GraphNode;
    const label = graphNode.label;
    const fontSize = 14 / globalScale;
    const radius = 12 + (graphNode.strength || 5) * 0.8;

    // Modern, vibrant colors based on status
    let nodeColor = "#3b82f6";
    let shadowColor = "rgba(59, 130, 246, 0.5)";
    let ringColor = "#93c5fd";

    if (graphNode.status === "active") {
      nodeColor = "#f97316";
      shadowColor = "rgba(249, 115, 22, 0.6)";
      ringColor = "#fdba74";
    } else if (graphNode.status === "resolving") {
      nodeColor = "#3b82f6";
      shadowColor = "rgba(59, 130, 246, 0.6)";
      ringColor = "#93c5fd";
    } else {
      nodeColor = "#22c55e";
      shadowColor = "rgba(34, 197, 94, 0.6)";
      ringColor = "#86efac";
    }

    // Draw outer glow ring
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(graphNode.x!, graphNode.y!, radius + 4, 0, 2 * Math.PI, false);
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 2 / globalScale;
    ctx.stroke();

    // Draw shadow for depth
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;

    // Draw node circle
    ctx.beginPath();
    ctx.arc(graphNode.x!, graphNode.y!, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = nodeColor;
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // White border
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3 / globalScale;
    ctx.stroke();

    // Modern text styling with rounded background
    const textY = graphNode.y! + radius + fontSize + 10;
    ctx.font = `600 ${fontSize}px "Inter", -apple-system, sans-serif`;
    const textWidth = ctx.measureText(label).width;
    const padding = 10;
    const borderRadius = 8;

    // Draw modern rounded background for text
    const bgX = graphNode.x! - textWidth / 2 - padding;
    const bgY = textY - fontSize / 2 - 4;
    const bgWidth = textWidth + padding * 2;
    const bgHeight = fontSize + 8;

    ctx.fillStyle = isDark
      ? 'rgba(15, 23, 42, 0.95)'
      : 'rgba(255, 255, 255, 0.98)';

    // Draw rounded rectangle
    ctx.beginPath();
    ctx.moveTo(bgX + borderRadius, bgY);
    ctx.lineTo(bgX + bgWidth - borderRadius, bgY);
    ctx.quadraticCurveTo(bgX + bgWidth, bgY, bgX + bgWidth, bgY + borderRadius);
    ctx.lineTo(bgX + bgWidth, bgY + bgHeight - borderRadius);
    ctx.quadraticCurveTo(bgX + bgWidth, bgY + bgHeight, bgX + bgWidth - borderRadius, bgY + bgHeight);
    ctx.lineTo(bgX + borderRadius, bgY + bgHeight);
    ctx.quadraticCurveTo(bgX, bgY + bgHeight, bgX, bgY + bgHeight - borderRadius);
    ctx.lineTo(bgX, bgY + borderRadius);
    ctx.quadraticCurveTo(bgX, bgY, bgX + borderRadius, bgY);
    ctx.closePath();
    ctx.fill();

    // Border for text background
    ctx.strokeStyle = isDark
      ? 'rgba(71, 85, 105, 0.3)'
      : 'rgba(203, 213, 225, 0.6)';
    ctx.lineWidth = 1 / globalScale;
    ctx.stroke();

    // Text label with modern font
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = isDark ? '#f1f5f9' : '#1e293b';
    ctx.fillText(label, graphNode.x!, textY);
  }, [isDark]);

  // Link colors based on theme
  const linkColor = isDark ? "rgba(148, 163, 184, 0.6)" : "rgba(71, 85, 105, 0.7)";

  // Group nodes by category for rendering group labels
  const groupedNodes = graphData.nodes.reduce((acc, node) => {
    const group = node.group || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(node);
    return acc;
  }, {} as Record<string, GraphNode[]>);

  // Custom function to draw group labels
  const paintGroupLabels = useCallback((ctx: CanvasRenderingContext2D) => {
    Object.entries(groupedNodes).forEach(([groupName, nodes]) => {
      if (nodes.length === 0) return;

      // Calculate group center
      const centerX = nodes.reduce((sum, n) => sum + (n.x || 0), 0) / nodes.length;
      const centerY = nodes.reduce((sum, n) => sum + (n.y || 0), 0) / nodes.length;

      // Draw group label background
      ctx.font = 'bold 18px Sans-Serif';
      const labelWidth = ctx.measureText(groupName).width;
      const padding = 12;

      ctx.fillStyle = isDark ? 'rgba(30, 41, 59, 0.85)' : 'rgba(241, 245, 249, 0.9)';
      ctx.fillRect(
        centerX - labelWidth / 2 - padding,
        centerY - 40 - 12,
        labelWidth + padding * 2,
        30
      );

      // Draw group label border
      ctx.strokeStyle = isDark ? 'rgba(100, 116, 139, 0.5)' : 'rgba(148, 163, 184, 0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        centerX - labelWidth / 2 - padding,
        centerY - 40 - 12,
        labelWidth + padding * 2,
        30
      );

      // Draw group label text
      ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(groupName, centerX, centerY - 40 + 3);
    });
  }, [groupedNodes, isDark]);

  return (
    <div className="relative w-full h-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <ForceGraph2D
        ref={fgRef}
        width={width}
        height={height}
        graphData={graphData}
        nodeLabel="concept"
        nodeCanvasObject={paintNode}
        nodeCanvasObjectMode={() => 'after'}
        onNodeClick={(node: any) => onNodeClick(node as GraphNode)}
        linkColor={() => linkColor}
        linkWidth={3}
        backgroundColor="transparent"
        d3VelocityDecay={0.3}
        d3AlphaDecay={0.02}
        d3AlphaMin={0.001}
        warmupTicks={100}
        cooldownTicks={200}
        cooldownTime={3000}
        onEngineStop={() => {
          if (fgRef.current) {
            fgRef.current.zoomToFit(400, 50);
          }
        }}
        onRenderFramePost={paintGroupLabels}
      />
    </div>
  );
}
