import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";

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
  // Enforce dark theme for space visualization
  const theme = 'dark'; 
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });

  useEffect(() => {
    // Process data to ensure it's in the right format for force-graph
    // We create a deep copy to avoid mutating props
    if (data) {
      setGraphData({
        nodes: data.nodes.map(n => ({ ...n })),
        edges: data.edges.map(e => ({ ...e }))
      });
    }
  }, [data]);

  const paintNode = useCallback((node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.label;
    const fontSize = 12 / globalScale;
    const radius = 4 + (node.strength || 5) * 0.5; // Size based on strength
    
    // Draw "Black Hole" effect for active misconceptions
    if (node.status === "active") {
      // Outer glow
      const gradient = ctx.createRadialGradient(node.x!, node.y!, radius * 0.5, node.x!, node.y!, radius * 3);
      gradient.addColorStop(0, "rgba(0, 0, 0, 1)"); // Dark center
      gradient.addColorStop(0.4, "rgba(249, 115, 22, 0.8)"); // Orange rim
      gradient.addColorStop(1, "rgba(249, 115, 22, 0)"); // Fade out

      ctx.beginPath();
      ctx.arc(node.x!, node.y!, radius * 3, 0, 2 * Math.PI, false);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = "#000";
      ctx.fill();
      ctx.strokeStyle = "#f97316";
      ctx.lineWidth = 1 / globalScale;
      ctx.stroke();
    } 
    // "Protostar" for resolving
    else if (node.status === "resolving") {
      const gradient = ctx.createRadialGradient(node.x!, node.y!, 0, node.x!, node.y!, radius * 2);
      gradient.addColorStop(0, "rgba(59, 130, 246, 1)"); // Blue core
      gradient.addColorStop(1, "rgba(59, 130, 246, 0)"); // Fade

      ctx.beginPath();
      ctx.arc(node.x!, node.y!, radius * 2, 0, 2 * Math.PI, false);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = "#3b82f6";
      ctx.fill();
    }
    // "Star" for resolved
    else {
      const gradient = ctx.createRadialGradient(node.x!, node.y!, 0, node.x!, node.y!, radius * 2);
      gradient.addColorStop(0, "rgba(34, 197, 94, 1)"); // Green core
      gradient.addColorStop(1, "rgba(34, 197, 94, 0)"); // Fade

      ctx.beginPath();
      ctx.arc(node.x!, node.y!, radius * 2, 0, 2 * Math.PI, false);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = "#22c55e";
      ctx.fill();
    }

    // Text label
    ctx.font = `${fontSize}px Sans-Serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(label, node.x!, node.y! + radius + fontSize + 2);
  }, []);

  return (
    <div className="relative w-full h-full bg-gray-900 overflow-hidden">
      {/* Starfield background effect could be added here with CSS or another canvas layer */}
      <div className="absolute inset-0 pointer-events-none bg-[url('/stars-bg.png')] opacity-50" />
      
      <ForceGraph2D
        ref={fgRef}
        width={width}
        height={height}
        graphData={graphData}
        nodeLabel="concept"
        nodeCanvasObject={paintNode}
        onNodeClick={onNodeClick}
        linkColor={() => "rgba(255, 255, 255, 0.2)"}
        linkWidth={1}
        backgroundColor="#0f172a" // Slate-900
        d3VelocityDecay={0.1}
        cooldownTicks={100}
        onEngineStop={() => fgRef.current?.zoomToFit(400)}
      />
    </div>
  );
}
