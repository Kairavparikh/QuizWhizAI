"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, XCircle, Calendar } from "lucide-react";

interface Answer {
  id: number;
  answerText: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  questionText: string;
  answers: Answer[];
}

interface Quiz {
  id: number;
  name: string;
  description: string;
  questions: Question[];
}

interface Class {
  id: number;
  name: string;
  subject: string;
  members: any[];
}

export default function QuizPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const quizzId = params.quizzId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [requireConfidence, setRequireConfidence] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchQuiz();
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizzId]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/quizz/${quizzId}`);
      if (response.ok) {
        const data = await response.json();
        setQuiz(data);
      } else {
        console.error("Failed to fetch quiz");
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes");
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const handleAssign = async () => {
    if (!selectedClassId) {
      alert("Please select a class");
      return;
    }

    setAssigning(true);

    try {
      const response = await fetch(`/api/classes/${selectedClassId}/assign-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: parseInt(quizzId),
          dueDate: dueDate || null,
          requireConfidence,
        }),
      });

      if (response.ok) {
        alert("Quiz assigned successfully!");
        setShowAssignDialog(false);
        router.push("/teacher/dashboard");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading quiz preview...</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Quiz not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => router.push("/teacher/dashboard")}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{quiz.name}</h1>
        {quiz.description && (
          <p className="text-lg text-gray-600 dark:text-gray-400">{quiz.description}</p>
        )}
        <div className="mt-4 inline-block bg-blue-100 dark:bg-blue-900/30 rounded-full px-4 py-2">
          <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
            Preview Mode - {quiz.questions.length} Questions
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {quiz.questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                <span className="text-blue-600 dark:text-blue-400 mr-2">
                  Question {index + 1}:
                </span>
                {question.questionText}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {question.answers.map((answer, answerIndex) => (
                  <div
                    key={answer.id}
                    className={`p-4 rounded-lg border-2 ${
                      answer.isCorrect
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          {String.fromCharCode(65 + answerIndex)}.
                        </span>
                        <span className="text-gray-900 dark:text-gray-100">
                          {answer.answerText}
                        </span>
                      </div>
                      {answer.isCorrect && (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-sm font-semibold">Correct Answer</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex gap-4 justify-center">
        <Button
          variant="outline"
          onClick={() => router.push("/teacher/dashboard")}
        >
          Back to Dashboard
        </Button>
        <Button onClick={() => setShowAssignDialog(true)}>
          Assign to Class
        </Button>
      </div>

      {/* Assign Dialog */}
      {showAssignDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Assign Quiz to Class
            </h2>

            <div className="space-y-6">
              {/* Class Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Select Class *
                </label>
                {classes.length === 0 ? (
                  <div className="text-center py-8 bg-gray-100 dark:bg-gray-900 rounded-lg">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      No classes found. Create a class first!
                    </p>
                    <Button onClick={() => router.push("/teacher/dashboard")}>
                      Go to Dashboard
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {classes.map((classItem) => (
                      <div
                        key={classItem.id}
                        onClick={() => setSelectedClassId(classItem.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                          selectedClassId === classItem.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                              {classItem.name}
                            </h3>
                            {classItem.subject && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {classItem.subject}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {classItem.members.length} students
                            </p>
                          </div>
                          {selectedClassId === classItem.id && (
                            <CheckCircle2 className="w-6 h-6 text-blue-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Due Date */}
              {selectedClassId && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Due Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500"
                    />
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
                    <label
                      htmlFor="requireConfidence"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                    >
                      Require confidence tracking
                    </label>
                  </div>
                </>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-6 mt-6 border-t">
              <Button
                type="button"
                onClick={() => setShowAssignDialog(false)}
                variant="outline"
                className="flex-1"
                disabled={assigning}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssign}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={!selectedClassId || assigning}
              >
                {assigning ? "Assigning..." : "Assign Quiz"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
