"use client";

import { useState, useEffect, useCallback } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import { Brain, ArrowLeft, Sparkles, AlertCircle, TrendingUp, CheckCircle, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertDialog } from "@/components/ui/AlertDialog";

interface GraphNode {
  id: number;
  label: string;
  concept: string;
  status: "active" | "resolving" | "resolved";
  strength: number;
  occurrenceCount: number;
  group: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: any[];
}

const CustomNode = ({ data }: any) => {
  const getStatusColor = () => {
    switch (data.status) {
      case "active":
        return "bg-orange-500 border-orange-600";
      case "resolving":
        return "bg-blue-500 border-blue-600";
      case "resolved":
        return "bg-green-500 border-green-600";
      default:
        return "bg-gray-500 border-gray-600";
    }
  };

  const getStatusIcon = () => {
    switch (data.status) {
      case "active":
        return <AlertCircle className="w-3 h-3" />;
      case "resolving":
        return <TrendingUp className="w-3 h-3" />;
      case "resolved":
        return <CheckCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`px-6 py-4 rounded-xl ${getStatusColor()} text-white shadow-lg cursor-pointer hover:shadow-xl transition-shadow min-w-[160px]`}
      onClick={data.onClick}
    >
      <div className="flex items-center gap-2 mb-1">
        {getStatusIcon()}
        <div className="font-bold text-sm">{data.label}</div>
      </div>
      <div className="text-lg font-bold">{data.progress}%</div>
    </div>
  );
};

const CategoryHeaderNode = ({ data }: any) => {
  return (
    <div className="text-center p-2">
      <div className="font-bold text-lg text-gray-900 dark:text-gray-100">
        {data.category}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {data.count} {data.count === 1 ? 'topic' : 'topics'}
      </div>
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
  categoryHeader: CategoryHeaderNode,
};

export default function MisconceptionGraphPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [includeResolved, setIncludeResolved] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<GraphNode | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  const handleBackClick = () => {
    if (returnTo) {
      router.push(`/quizz/${returnTo}/submission/latest`);
    } else {
      router.push('/dashboard/misconceptions');
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, [includeResolved]);

  const fetchGraphData = async () => {
    try {
      const response = await fetch(`/api/misconception/graph?includeResolved=${includeResolved}`);
      if (response.ok) {
        const data: GraphData = await response.json();
        setGraphData(data);
        buildFlowChart(data);
      }
    } catch (error) {
      console.error("Error fetching graph data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Extract broader, more general categories from concepts
  const extractBroadCategory = (concept: string): string => {
    // Common academic/topic keywords to identify
    const generalTopics: { [key: string]: string[] } = {
      "Mathematics": ["math", "algebra", "calculus", "geometry", "trigonometry", "equation", "function"],
      "Statistics": ["statistics", "probability", "distribution", "variance", "mean", "median", "regression", "correlation"],
      "Machine Learning": ["ml", "machine learning", "neural", "model", "training", "learning", "algorithm", "classification", "clustering"],
      "Data Science": ["data", "analysis", "analytics", "dataset", "feature"],
      "Programming": ["code", "programming", "function", "variable", "loop", "algorithm", "syntax"],
      "Physics": ["physics", "force", "energy", "motion", "velocity", "acceleration"],
      "Chemistry": ["chemistry", "reaction", "molecule", "element", "compound"],
      "Biology": ["biology", "cell", "organism", "dna", "gene", "evolution"],
      "Computer Science": ["computer", "algorithm", "complexity", "data structure", "sorting"],
      "Linear Algebra": ["matrix", "vector", "linear", "eigenvalue", "dimension"],
      "Optimization": ["optimization", "minimize", "maximize", "gradient", "descent"],
      "Deep Learning": ["deep learning", "cnn", "rnn", "transformer", "attention"],
    };

    const conceptLower = concept.toLowerCase();

    // Check if concept matches any general topic
    for (const [category, keywords] of Object.entries(generalTopics)) {
      if (keywords.some(keyword => conceptLower.includes(keyword))) {
        return category;
      }
    }

    // If no match, extract first 1-2 words as category
    const words = concept.split(/[-–—:,\/\s]+/).filter(w => w.length > 2);
    if (words.length > 0) {
      return words[0].charAt(0).toUpperCase() + words[0].slice(1);
    }

    return "General";
  };

  const buildFlowChart = (data: GraphData) => {
    if (!data || data.nodes.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    // Group nodes by broader categories
    const categoryGroups: { [key: string]: GraphNode[] } = {};
    data.nodes.forEach((node) => {
      const category = extractBroadCategory(node.concept);
      if (!categoryGroups[category]) {
        categoryGroups[category] = [];
      }
      categoryGroups[category].push(node);
    });

    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];

    // Upside-down bar graph layout: categories spread horizontally, nodes stack vertically downward
    const categories = Object.entries(categoryGroups).sort((a, b) => b[1].length - a[1].length);
    const categoryWidth = 280; // Width of each bar/column
    const categorySpacing = 100; // Space between columns
    const nodeHeight = 120; // Height of each node
    const nodeVerticalGap = 20; // Gap between stacked nodes
    const topPadding = 100; // Space for category labels

    categories.forEach(([category, misconceptions], categoryIndex) => {
      // Calculate x position for this category
      const xPosition = categoryIndex * (categoryWidth + categorySpacing) + 100;

      // Sort by strength (highest priority first)
      const sortedMisconceptions = [...misconceptions].sort((a, b) => b.strength - a.strength);

      // Add category label node at the top
      flowNodes.push({
        id: `category-${category}`,
        type: "categoryHeader",
        position: {
          x: xPosition,
          y: 20,
        },
        data: {
          category: category,
          count: misconceptions.length,
        },
        style: {
          background: 'transparent',
          border: 'none',
          padding: 0,
          width: categoryWidth,
        },
        draggable: false,
        selectable: false,
      });

      // Stack nodes vertically downward
      sortedMisconceptions.forEach((node, index) => {
        const progress = Math.max(0, 100 - node.strength * 10);
        const yPosition = topPadding + (index * (nodeHeight + nodeVerticalGap));

        flowNodes.push({
          id: node.id.toString(),
          type: "custom",
          position: {
            x: xPosition,
            y: yPosition,
          },
          data: {
            label: node.label.length > 30 ? node.label.substring(0, 30) + "..." : node.label,
            status: node.status,
            progress: Math.round(progress),
            onClick: () => handleNodeClick(node),
            fullNode: node,
          },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
          style: {
            width: categoryWidth - 20,
          },
        });

        // Connect to next node in same category (downward connection)
        if (index < sortedMisconceptions.length - 1) {
          flowEdges.push({
            id: `e-${node.id}-${sortedMisconceptions[index + 1].id}`,
            source: node.id.toString(),
            target: sortedMisconceptions[index + 1].id.toString(),
            type: "straight",
            animated: node.status !== "resolved",
            style: {
              stroke: node.status === "active" ? "#f97316" :
                      node.status === "resolving" ? "#3b82f6" : "#22c55e",
              strokeWidth: 3,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: node.status === "active" ? "#f97316" :
                     node.status === "resolving" ? "#3b82f6" : "#22c55e",
            },
          });
        }
      });
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
  };

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
  };

  const handleDeleteClick = (node: GraphNode) => {
    setNodeToDelete(node);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!nodeToDelete) return;

    try {
      const response = await fetch(`/api/misconception/delete?id=${nodeToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSuccessMessage("Misconception deleted successfully");
        setShowSuccessAlert(true);
        setShowConfirmDelete(false);
        setNodeToDelete(null);
        setSelectedNode(null);
        // Refresh the graph data
        await fetchGraphData();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || "Failed to delete misconception");
        setShowErrorAlert(true);
      }
    } catch (error) {
      console.error("Error deleting misconception:", error);
      setErrorMessage("An error occurred while deleting the misconception");
      setShowErrorAlert(true);
    }
  };

  const handleDeleteAllClick = () => {
    setShowConfirmDeleteAll(true);
  };

  const handleConfirmDeleteAll = async () => {
    setDeletingAll(true);
    try {
      const response = await fetch("/api/misconception/delete?deleteAll=true", {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(data.message || "All misconceptions deleted successfully");
        setShowSuccessAlert(true);
        setShowConfirmDeleteAll(false);
        setSelectedNode(null);
        // Refresh the graph data
        await fetchGraphData();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || "Failed to delete misconceptions");
        setShowErrorAlert(true);
      }
    } catch (error) {
      console.error("Error deleting all misconceptions:", error);
      setErrorMessage("An error occurred while deleting misconceptions");
      setShowErrorAlert(true);
    } finally {
      setDeletingAll(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!selectedNode) return;

    setGeneratingQuiz(true);
    try {
      const response = await fetch("/api/misconception/generate-adaptive-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          misconceptionIds: [selectedNode.id],
          questionCount: 5,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/quizz/${data.quizzId}`);
      } else {
        setErrorMessage("Failed to generate adaptive quiz. Please try again.");
        setShowErrorAlert(true);
      }
    } catch (error) {
      console.error("Error generating adaptive quiz:", error);
      setErrorMessage("An error occurred while generating the quiz.");
      setShowErrorAlert(true);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-orange-600 dark:text-orange-400";
      case "resolving":
        return "text-blue-600 dark:text-blue-400";
      case "resolved":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Brain className="w-16 h-16 mx-auto mb-4 animate-pulse text-blue-600" />
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading learning path...</p>
        </div>
      </div>
    );
  }

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center py-12">
          <Brain className="w-24 h-24 mx-auto mb-6 text-gray-400" />
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            No Learning Path Yet
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Complete some quizzes to build your personalized learning path!
          </p>
          <Link href="/quizz/new">
            <Button size="lg" variant="neo">
              Create Your First Quiz
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden fixed inset-0">
      {/* Compact Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 z-10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={handleBackClick}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Learning Path
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Compact Legend */}
            <div className="flex items-center gap-4 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-orange-500"></div>
                <span className="text-xs text-gray-700 dark:text-gray-300">Needs Focus</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span className="text-xs text-gray-700 dark:text-gray-300">In Progress</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span className="text-xs text-gray-700 dark:text-gray-300">Mastered</span>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
              <input
                type="checkbox"
                checked={includeResolved}
                onChange={(e) => setIncludeResolved(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300">
                Show Mastered
              </span>
            </label>

            {graphData && graphData.nodes.length > 0 && (
              <Button
                onClick={handleDeleteAllClick}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-300 dark:border-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Full Screen Flow Chart */}
      <div className="flex-1 w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{
            padding: 0.1,
            minZoom: 0.3,
            maxZoom: 1.5,
          }}
          className="bg-gray-50 dark:bg-gray-900"
          minZoom={0.1}
          maxZoom={2}
        >
          <Background color="#aaa" gap={16} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              if (node.data.status === "active") return "#f97316";
              if (node.data.status === "resolving") return "#3b82f6";
              if (node.data.status === "resolved") return "#22c55e";
              return "#6b7280";
            }}
            position="bottom-right"
          />
        </ReactFlow>
      </div>

      {/* Side Panel */}
      {selectedNode && (
        <div className="fixed top-20 right-4 w-96 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 shadow-2xl z-20">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {selectedNode.label}
            </h2>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Core Concept
              </label>
              <p className="text-gray-900 dark:text-gray-100">
                {selectedNode.concept}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Status
              </label>
              <p className={`capitalize font-medium ${getStatusColor(selectedNode.status)}`}>
                {selectedNode.status === "active" ? "Needs Focus" :
                 selectedNode.status === "resolving" ? "In Progress" : "Mastered"}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">
                Progress
              </label>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${
                    selectedNode.status === "active"
                      ? "bg-orange-500"
                      : selectedNode.status === "resolving"
                      ? "bg-blue-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${Math.max(0, 100 - selectedNode.strength * 10)}%` }}
                ></div>
              </div>
              <p className="text-right text-sm text-gray-600 dark:text-gray-400 mt-1">
                {Math.max(0, 100 - selectedNode.strength * 10)}%
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Strength
                </label>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {selectedNode.strength}/10
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Times Seen
                </label>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {selectedNode.occurrenceCount}
                </p>
              </div>
            </div>

            {selectedNode.status !== "resolved" && (
              <>
                <hr className="border-gray-200 dark:border-gray-700" />
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Next Steps:
                  </h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                    <li>Practice targeted questions</li>
                    <li>Review core concepts</li>
                    <li>Track your improvement</li>
                  </ul>
                </div>

                <Button
                  onClick={handleGenerateQuiz}
                  disabled={generatingQuiz}
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {generatingQuiz ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Practice This
                    </>
                  )}
                </Button>
              </>
            )}

            <hr className="border-gray-200 dark:border-gray-700" />
            <Button
              onClick={() => handleDeleteClick(selectedNode)}
              size="lg"
              variant="outline"
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-300 dark:border-red-700"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Delete Misconception
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for single delete */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false);
          setNodeToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Misconception"
        message={`Are you sure you want to delete "${nodeToDelete?.label}"? This action cannot be undone.`}
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Confirmation Dialog for delete all */}
      <ConfirmDialog
        isOpen={showConfirmDeleteAll}
        onClose={() => setShowConfirmDeleteAll(false)}
        onConfirm={handleConfirmDeleteAll}
        title="Delete All Misconceptions"
        message={`Are you sure you want to delete ALL ${graphData?.nodes.length || 0} misconception${(graphData?.nodes.length || 0) !== 1 ? 's' : ''}? This action cannot be undone and will permanently remove all your misconception data.`}
        variant="danger"
        confirmText={deletingAll ? "Deleting..." : "Delete All"}
        cancelText="Cancel"
      />

      {/* Success Alert Dialog */}
      <AlertDialog
        isOpen={showSuccessAlert}
        onClose={() => setShowSuccessAlert(false)}
        message={successMessage}
        variant="success"
      />

      {/* Error Alert Dialog */}
      <AlertDialog
        isOpen={showErrorAlert}
        onClose={() => setShowErrorAlert(false)}
        message={errorMessage}
        variant="error"
      />
    </div>
  );
}
