"use client";

import { useState, useEffect, useCallback } from "react";
import KnowledgeGalaxy from "@/components/misconceptions/KnowledgeGalaxy";
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



export default function MisconceptionGraphPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [includeResolved, setIncludeResolved] = useState(false);
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
      }
    } catch (error) {
      console.error("Error fetching graph data:", error);
    } finally {
      setLoading(false);
    }
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
        <div className="relative">
          {/* Animated background circles */}
          <div className="absolute -inset-20 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />

          {/* Main content */}
          <div className="relative flex flex-col items-center gap-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
            {/* Animated icon */}
            <div className="relative">
              <Brain className="w-20 h-20 text-blue-600 dark:text-blue-400 animate-pulse" />
              <div className="absolute inset-0 animate-ping">
                <div className="w-full h-full rounded-full bg-blue-400/30" />
              </div>
            </div>

            {/* Animated text */}
            <div className="text-center">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 animate-pulse">
                Loading Learning Path
              </h2>
              <p className="text-gray-600 dark:text-gray-400">Analyzing your misconceptions...</p>
            </div>

            {/* Animated dots */}
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>

            {/* Progress bar */}
            <div className="w-64 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-pulse" />
            </div>
          </div>
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
    <div className="h-screen w-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden fixed inset-0 pt-16">
      {/* Compact Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 z-10 flex-shrink-0 mt-0">
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
      <div className="flex-1 w-full h-full pb-10">
        <KnowledgeGalaxy
          data={graphData || { nodes: [], edges: [] }}
          onNodeClick={handleNodeClick}
        />
      </div>

      {/* Side Panel */}
      {selectedNode && (
        <div className="fixed top-24 right-4 w-96 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 shadow-2xl z-20 max-h-[calc(100vh-7rem)] overflow-y-auto">
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

      {/* Status Explanation - Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 px-6 py-2 z-20">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            <span className="font-semibold">How Status Works:</span>{" "}
            <span className="text-orange-600 dark:text-orange-400 font-medium">Needs Focus</span> = Wrong answers or new mistakes • {" "}
            <span className="text-blue-600 dark:text-blue-400 font-medium">In Progress</span> = 1 correct answer with high confidence • {" "}
            <span className="text-green-600 dark:text-green-400 font-medium">Mastered</span> = 2+ correct answers in a row with high confidence
          </p>
        </div>
      </div>
    </div>
  );
}
