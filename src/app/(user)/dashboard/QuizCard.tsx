"use client";

import Link from "next/link";
import { BookOpen, ArrowRight, FileText, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AlertDialog } from "@/components/ui/AlertDialog";

export type Quiz = {
  id: number;
  name: string | null;
  description: string | null;
  userId: string | null;
  questionCount?: number;
  lastAttempt?: Date | null;
};

type Props = {
  quiz: Quiz;
  onDelete?: (quizId: number) => void;
};

export default function QuizCard({ quiz, onDelete }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/quizz/${quiz.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onDelete?.(quiz.id);
      } else {
        setErrorMessage("Failed to delete quiz. Please try again.");
        setShowErrorAlert(true);
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
      setErrorMessage("An error occurred while deleting the quiz.");
      setShowErrorAlert(true);
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <TooltipProvider>
      <div className="group relative bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl overflow-hidden">
        {/* Gradient accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Delete button */}
        <button
          onClick={handleDeleteClick}
          disabled={isDeleting}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-50"
          aria-label="Delete quiz"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 cursor-help">
                      {quiz.name || "Untitled Quiz"}
                    </h3>
                  </TooltipTrigger>
                  {quiz.name && quiz.name.length > 30 && (
                    <TooltipContent className="max-w-sm">
                      <p>{quiz.name}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Description */}
          {quiz.description && (
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 min-h-[40px] cursor-help">
                  {quiz.description}
                </p>
              </TooltipTrigger>
              {quiz.description.length > 80 && (
                <TooltipContent className="max-w-md">
                  <p>{quiz.description}</p>
                </TooltipContent>
              )}
            </Tooltip>
          )}

        {/* Metadata */}
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500 dark:text-gray-400">
          {quiz.questionCount !== undefined && (
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>{quiz.questionCount} questions</span>
            </div>
          )}
          {quiz.lastAttempt && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>Last: {new Date(quiz.lastAttempt).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Link href={`/quizz/${quiz.id}`} className="block">
          <Button
            variant="neo"
            className="w-full group/btn"
            size="lg"
          >
            <span>Start Quiz</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>

      {/* Decorative corner gradient */}
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-blue-500/5 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>

    {/* Confirmation Dialog */}
    <ConfirmDialog
      isOpen={showConfirmDelete}
      onClose={() => setShowConfirmDelete(false)}
      onConfirm={handleConfirmDelete}
      title="Delete Quiz"
      message={`Are you sure you want to delete "${quiz.name || 'this quiz'}"? This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      variant="danger"
    />

    {/* Error Alert Dialog */}
    <AlertDialog
      isOpen={showErrorAlert}
      onClose={() => setShowErrorAlert(false)}
      message={errorMessage}
      variant="error"
    />
    </TooltipProvider>
  );
}
