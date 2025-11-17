"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Search, Calendar, CheckCircle2 } from "lucide-react";

interface Quiz {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  questions?: any[];
}

interface AssignQuizDialogProps {
  classId: number;
  onClose: () => void;
  onAssigned: () => void;
}

export default function AssignQuizDialog({
  classId,
  onClose,
  onAssigned,
}: AssignQuizDialogProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [requireConfidence, setRequireConfidence] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      // Fetch user's quizzes
      const response = await fetch("/api/quizz");
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data.quizzes || []);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedQuizId) {
      alert("Please select a quiz to assign");
      return;
    }

    setAssigning(true);

    try {
      const response = await fetch(`/api/classes/${classId}/assign-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: selectedQuizId,
          dueDate: dueDate || null,
          requireConfidence,
        }),
      });

      if (response.ok) {
        onAssigned();
      } else {
        const error = await response.json();
        alert(`Failed to assign quiz: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error assigning quiz:", error);
      alert("Failed to assign quiz");
    } finally {
      setAssigning(false);
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) =>
    (quiz.name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get minimum date (today) for due date input
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Assign Quiz to Class</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          {/* Quiz Selection */}
          <div>
            <h3 className="font-semibold mb-3">Select a Quiz</h3>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading quizzes...</div>
            ) : filteredQuizzes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "No quizzes found matching your search" : "No quizzes available. Create a quiz first!"}
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    onClick={() => setSelectedQuizId(quiz.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition ${
                      selectedQuizId === quiz.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{quiz.name || `Quiz #${quiz.id}`}</h4>
                        {quiz.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {quiz.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span>{quiz.questions?.length || 0} questions</span>
                          <span>Created {formatDate(quiz.createdAt)}</span>
                        </div>
                      </div>
                      {selectedQuizId === quiz.id && (
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assignment Options */}
          {selectedQuizId && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">Assignment Options</h3>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={today}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for no due date
                </p>
              </div>

              {/* Require Confidence */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="requireConfidence"
                  checked={requireConfidence}
                  onChange={(e) => setRequireConfidence(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="requireConfidence" className="text-sm font-medium cursor-pointer">
                  Require confidence tracking
                </label>
              </div>
              <p className="text-xs text-gray-500 ml-7">
                Students will rate their confidence level for each question
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 dark:bg-gray-900">
          <Button variant="outline" onClick={onClose} disabled={assigning}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedQuizId || assigning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {assigning ? "Assigning..." : "Assign Quiz"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
