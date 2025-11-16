"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Download, Eye } from "lucide-react";

interface FolderInfo {
  id: number;
  name: string;
  description: string | null;
}

interface QuizInfo {
  id: number;
  name: string | null;
  description: string | null;
  documentContent: string | null;
  questionCount: number;
  createdAt: string;
}

interface Props {
  folder: FolderInfo;
  quizzes: QuizInfo[];
}

export default function FolderContents({ folder, quizzes }: Props) {
  const router = useRouter();
  const [selectedQuiz, setSelectedQuiz] = useState<QuizInfo | null>(null);

  const downloadContent = (quiz: QuizInfo) => {
    if (!quiz.documentContent) {
      alert("No content available for this quiz");
      return;
    }

    const blob = new Blob([quiz.documentContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${quiz.name || "quiz"}-content.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          onClick={() => router.back()}
          variant="outline"
          size="lg"
          className="gap-2 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {folder.name}
        </h1>
        {folder.description && (
          <p className="text-gray-600 dark:text-gray-400">{folder.description}</p>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {quizzes.length} {quizzes.length === 1 ? "quiz" : "quizzes"} in this folder
        </p>
      </div>

      {/* Quiz List */}
      {quizzes.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center bg-gray-50 dark:bg-gray-900/50">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            No quizzes yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Create a quiz in this folder to see it here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 hover:border-blue-400 dark:hover:border-blue-600 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {quiz.name || "Untitled Quiz"}
                  </h3>
                  {quiz.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {quiz.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>{quiz.questionCount} questions</span>
                    <span>Created {new Date(quiz.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {quiz.documentContent && (
                    <>
                      <Button
                        onClick={() => setSelectedQuiz(quiz)}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                      <Button
                        onClick={() => downloadContent(quiz)}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => router.push(`/quizz/${quiz.id}`)}
                    variant="neo"
                    size="sm"
                  >
                    Take Quiz
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content Preview Modal */}
      {selectedQuiz && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {selectedQuiz.name || "Quiz Content"}
              </h3>
              <button
                onClick={() => setSelectedQuiz(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono">
                  {selectedQuiz.documentContent}
                </pre>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-6 border-t border-gray-200 dark:border-gray-700">
              <Button onClick={() => setSelectedQuiz(null)} variant="outline">
                Close
              </Button>
              <Button onClick={() => downloadContent(selectedQuiz)} className="gap-2">
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
