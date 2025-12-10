"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, CheckCircle, AlertCircle, Target, Sparkles, ArrowLeft, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AlertDialog as AlertDialogComponent } from "@/components/ui/AlertDialog";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import FolderManager from "@/components/FolderManager";

interface Misconception {
  id: number;
  concept: string;
  misconceptionType: string;
  description: string;
  status: "active" | "resolving" | "resolved";
  strength: number;
  occurrenceCount: number;
  correctStreakCount: number;
  detectedAt: string;
  resolvedAt: string | null;
  lastTestedAt: string | null;
}

interface MisconceptionProfile {
  misconceptions: Misconception[];
  grouped: {
    active: Misconception[];
    resolving: Misconception[];
    resolved: Misconception[];
  };
  patterns: any[];
  stats: {
    total: number;
    active: number;
    resolving: number;
    resolved: number;
    averageStrength: number;
  };
}

interface ConceptGroup {
  concept: string;
  misconceptions: Misconception[];
  totalStrength: number;
  averageStrength: number;
  activeCount: number;
  resolvingCount: number;
  resolvedCount: number;
}

export default function MisconceptionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const [profile, setProfile] = useState<MisconceptionProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "resolving" | "resolved">("active");
  const [selectedMisconceptions, setSelectedMisconceptions] = useState<number[]>([]);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [expandedConcepts, setExpandedConcepts] = useState<Set<string>>(new Set());
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [misconceptionToDelete, setMisconceptionToDelete] = useState<Misconception | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  const handleBackClick = () => {
    if (returnTo) {
      router.push(`/quizz/${returnTo}/submission/latest`);
    } else {
      router.back();
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [selectedFolderId]);

  const fetchProfile = async () => {
    try {
      const url = selectedFolderId
        ? `/api/misconception/profile?folderId=${selectedFolderId}`
        : "/api/misconception/profile";
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching misconception profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleConcept = (concept: string) => {
    const newExpanded = new Set(expandedConcepts);
    if (newExpanded.has(concept)) {
      newExpanded.delete(concept);
    } else {
      newExpanded.add(concept);
    }
    setExpandedConcepts(newExpanded);
  };

  const handleDeleteClick = (misconception: Misconception) => {
    setMisconceptionToDelete(misconception);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!misconceptionToDelete) return;

    try {
      const response = await fetch(`/api/misconception/delete?id=${misconceptionToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAlertMessage("Misconception deleted successfully");
        setShowSuccessAlert(true);
        setShowConfirmDelete(false);
        setMisconceptionToDelete(null);
        // Refresh the profile data
        await fetchProfile();
      } else {
        const errorData = await response.json();
        setAlertMessage(errorData.error || "Failed to delete misconception");
        setShowErrorAlert(true);
      }
    } catch (error) {
      console.error("Error deleting misconception:", error);
      setAlertMessage("An error occurred while deleting the misconception");
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
        setAlertMessage(data.message || "All misconceptions deleted successfully");
        setShowSuccessAlert(true);
        setShowConfirmDeleteAll(false);
        // Refresh the profile data
        await fetchProfile();
      } else {
        const errorData = await response.json();
        setAlertMessage(errorData.error || "Failed to delete misconceptions");
        setShowErrorAlert(true);
      }
    } catch (error) {
      console.error("Error deleting all misconceptions:", error);
      setAlertMessage("An error occurred while deleting misconceptions");
      setShowErrorAlert(true);
    } finally {
      setDeletingAll(false);
    }
  };

  const handleGenerateAdaptiveQuiz = async (misconceptionIds: number[]) => {
    if (misconceptionIds.length === 0) return;

    setGeneratingQuiz(true);
    try {
      const response = await fetch("/api/misconception/generate-adaptive-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          misconceptionIds,
          questionCount: Math.min(misconceptionIds.length * 3, 15),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // If we came from a quiz results page, pass that quiz ID as returnTo
        const quizUrl = returnTo
          ? `/quizz/${data.quizzId}?returnTo=${returnTo}`
          : `/quizz/${data.quizzId}`;
        router.push(quizUrl);
      } else {
        alert("Failed to generate adaptive quiz");
      }
    } catch (error) {
      console.error("Error generating adaptive quiz:", error);
      alert("Error generating adaptive quiz");
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700";
      case "resolving":
        return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <AlertCircle className="w-4 h-4" />;
      case "resolving":
        return <TrendingUp className="w-4 h-4" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Group misconceptions by broader concepts
  const groupByBroaderConcepts = (misconceptions: Misconception[]): ConceptGroup[] => {
    // Extract key topics from concepts to create broader groupings
    const conceptMap: { [key: string]: Misconception[] } = {};

    misconceptions.forEach((m) => {
      // Try to extract a broader topic from the concept
      // For example: "PCA dimensionality reduction" -> "PCA"
      // "Linear Regression assumptions" -> "Linear Regression"
      let broaderConcept = m.concept;

      // Split on common delimiters and take first meaningful part
      const parts = m.concept.split(/[-–—:,\/]/);
      if (parts.length > 0) {
        broaderConcept = parts[0].trim();
      }

      // Further simplify by taking first 2-3 words max
      const words = broaderConcept.split(' ');
      if (words.length > 3) {
        broaderConcept = words.slice(0, 3).join(' ');
      }

      if (!conceptMap[broaderConcept]) {
        conceptMap[broaderConcept] = [];
      }
      conceptMap[broaderConcept].push(m);
    });

    const groups: ConceptGroup[] = Object.entries(conceptMap).map(([concept, items]) => {
      const totalStrength = items.reduce((sum, m) => sum + m.strength, 0);
      const averageStrength = totalStrength / items.length;
      const activeCount = items.filter((m) => m.status === "active").length;
      const resolvingCount = items.filter((m) => m.status === "resolving").length;
      const resolvedCount = items.filter((m) => m.status === "resolved").length;

      return {
        concept,
        misconceptions: items.sort((a, b) => b.strength - a.strength),
        totalStrength,
        averageStrength,
        activeCount,
        resolvingCount,
        resolvedCount,
      };
    });

    return groups.sort((a, b) => b.averageStrength - a.averageStrength);
  };

  // Filter misconceptions by status
  const filteredMisconceptions = profile
    ? selectedStatus === "all"
      ? profile.misconceptions
      : profile.grouped[selectedStatus]
    : [];

  const conceptGroups = groupByBroaderConcepts(filteredMisconceptions);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Brain className="w-16 h-16 mx-auto mb-4 animate-pulse text-blue-600" />
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Loading your misconception profile...
          </p>
        </div>
      </div>
    );
  }

  if (!profile || profile.misconceptions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center py-12">
          <Brain className="w-24 h-24 mx-auto mb-6 text-gray-400" />
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            No Misconceptions Detected Yet
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Complete some quizzes to start building your personalized misconception profile!
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
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={handleBackClick}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </Button>
            <Brain className="w-10 h-10 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Misconception Profile
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track and conquer your learning gaps
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href={returnTo ? `/dashboard/misconceptions/graph?returnTo=${returnTo}` : "/dashboard/misconceptions/graph"}>
              <Button variant="outline" size="lg">
                <Target className="w-5 h-5 mr-2" />
                View Graph
              </Button>
            </Link>
            {profile && profile.misconceptions.length > 0 && (
              <Button
                onClick={handleDeleteAllClick}
                variant="outline"
                size="lg"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-300 dark:border-red-700"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Delete All
              </Button>
            )}
          </div>
        </div>

        {/* Folder Filter */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
          <FolderManager
            onFolderSelect={setSelectedFolderId}
            selectedFolderId={selectedFolderId}
            showManagement={false}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {profile.stats.total}
                </p>
              </div>
              <Brain className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 dark:text-red-400">Active</p>
                <p className="text-3xl font-bold text-red-700 dark:text-red-300">
                  {profile.stats.active}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">Resolving</p>
                <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">
                  {profile.stats.resolving}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Resolved</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                  {profile.stats.resolved}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {["all", "active", "resolving", "resolved"].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status as any)}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              selectedStatus === status
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Concept Groups */}
      <div className="space-y-4">
        {conceptGroups.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              No {selectedStatus !== "all" ? selectedStatus : ""} misconceptions found
            </p>
          </div>
        ) : (
          conceptGroups.map((group) => (
            <div
              key={group.concept}
              className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Concept Header */}
              <div
                onClick={() => toggleConcept(group.concept)}
                className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {expandedConcepts.has(group.concept) ? (
                      <ChevronDown className="w-6 h-6 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-6 h-6 text-gray-500" />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {group.concept}
                      </h3>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span className="text-gray-600 dark:text-gray-400">
                            {group.activeCount} Active
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <span className="text-gray-600 dark:text-gray-400">
                            {group.resolvingCount} Resolving
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-gray-600 dark:text-gray-400">
                            {group.resolvedCount} Resolved
                          </span>
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          Avg Strength: {Math.round(group.averageStrength)}/10
                        </div>
                      </div>
                    </div>
                  </div>

                  {(group.activeCount > 0 || group.resolvingCount > 0) && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        const ids = group.misconceptions
                          .filter((m) => m.status !== "resolved")
                          .map((m) => m.id);
                        handleGenerateAdaptiveQuiz(ids);
                      }}
                      disabled={generatingQuiz}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Practice All
                    </Button>
                  )}
                </div>
              </div>

              {/* Misconceptions List */}
              {expandedConcepts.has(group.concept) && (
                <div className="border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-6 space-y-3">
                  {group.misconceptions.map((misconception) => (
                    <div
                      key={misconception.id}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${getStatusColor(
                                misconception.status
                              )}`}
                            >
                              {getStatusIcon(misconception.status)}
                              <span className="capitalize">{misconception.status}</span>
                            </div>
                          </div>
                          <p className="text-gray-900 dark:text-gray-100 font-medium mb-3">
                            {misconception.misconceptionType}
                          </p>
                          {misconception.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {misconception.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div>
                              <span className="font-semibold">Strength:</span> {misconception.strength}/10
                            </div>
                            <div>
                              <span className="font-semibold">Occurrences:</span> {misconception.occurrenceCount}
                            </div>
                            <div>
                              <span className="font-semibold">Correct Streak:</span> {misconception.correctStreakCount}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {misconception.status !== "resolved" && (
                            <Button
                              onClick={() => handleGenerateAdaptiveQuiz([misconception.id])}
                              disabled={generatingQuiz}
                              size="sm"
                              variant="outline"
                            >
                              <Sparkles className="w-4 h-4 mr-1" />
                              Practice
                            </Button>
                          )}
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(misconception);
                            }}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Confirmation Dialog for single delete */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false);
          setMisconceptionToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Misconception"
        message={`Are you sure you want to delete "${misconceptionToDelete?.misconceptionType}"? This action cannot be undone.`}
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
        message={`Are you sure you want to delete ALL ${profile?.misconceptions.length || 0} misconception${(profile?.misconceptions.length || 0) !== 1 ? 's' : ''}? This action cannot be undone and will permanently remove all your misconception data.`}
        variant="danger"
        confirmText={deletingAll ? "Deleting..." : "Delete All"}
        cancelText="Cancel"
      />

      {/* Success Alert */}
      <AlertDialogComponent
        isOpen={showSuccessAlert}
        onClose={() => setShowSuccessAlert(false)}
        message={alertMessage}
        variant="success"
      />

      {/* Error Alert */}
      <AlertDialogComponent
        isOpen={showErrorAlert}
        onClose={() => setShowErrorAlert(false)}
        message={alertMessage}
        variant="error"
      />

      {/* Status Explanation - Bottom Info */}
      <div className="mt-12 mb-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          How We Track Your Progress
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700 dark:text-red-300 mb-1">Needs Focus (Active)</p>
              <p className="text-gray-600 dark:text-gray-400">
                You answered incorrectly or showed uncertainty. These concepts need practice.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-700 dark:text-blue-300 mb-1">In Progress (Resolving)</p>
              <p className="text-gray-600 dark:text-gray-400">
                You&apos;ve answered correctly once with high confidence. One more to master it!
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-700 dark:text-green-300 mb-1">Mastered (Resolved)</p>
              <p className="text-gray-600 dark:text-gray-400">
                You&apos;ve demonstrated mastery with 2+ correct answers with high confidence. Great job!
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <span className="font-semibold">Strength (1-10):</span> Indicates how deeply rooted the misconception is.
            Increases when you get it wrong, decreases by 2 when you get it right with high confidence.
          </p>
        </div>
      </div>
    </div>
  );
}
