"use client";

import Link from "next/link";
import { BookOpen, ArrowRight, FileText, Calendar, X, Sparkles } from "lucide-react";
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
import { motion } from "framer-motion";

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
  index?: number;
};

export default function QuizCard({ quiz, onDelete, index = 0 }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isHovered, setIsHovered] = useState(false);

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: index * 0.1,
          ease: [0.22, 1, 0.36, 1]
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="group relative rounded-2xl overflow-hidden"
      >
        {/* Animated gradient border */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />

        <div className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
          {/* Top gradient accent bar with animation */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ transformOrigin: "left" }}
          />

          {/* Delete button with animation */}
          <motion.button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 shadow-lg disabled:opacity-50"
            aria-label="Delete quiz"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              scale: isHovered ? 1 : 0.8
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <X className="w-4 h-4" />
          </motion.button>

          <div className="p-6">
            {/* Header with animated icon */}
            <div className="flex items-start gap-4 mb-4">
              <motion.div
                className="relative p-3 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl"
                animate={{
                  rotate: isHovered ? [0, -10, 10, 0] : 0,
                }}
                transition={{
                  duration: 0.5,
                  ease: "easeInOut"
                }}
              >
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />

                {/* Sparkle effect */}
                <motion.div
                  className="absolute -top-1 -right-1"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: isHovered ? [0, 1, 0] : 0,
                    scale: isHovered ? [0, 1.2, 0] : 0,
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatDelay: 0.5
                  }}
                >
                  <Sparkles className="w-3 h-3 text-yellow-500" />
                </motion.div>
              </motion.div>

              <div className="flex-1 min-w-0">
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <motion.h3
                      className="text-xl font-bold text-gray-900 dark:text-gray-100 line-clamp-1 cursor-help"
                      animate={{
                        color: isHovered ? "rgb(37, 99, 235)" : undefined
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {quiz.name || "Untitled Quiz"}
                    </motion.h3>
                  </TooltipTrigger>
                  {quiz.name && quiz.name.length > 30 && (
                    <TooltipContent className="max-w-sm">
                      <p>{quiz.name}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
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

            {/* Metadata with stagger animation */}
            <motion.div
              className="flex items-center gap-4 mb-4 text-xs text-gray-500 dark:text-gray-400"
              initial="hidden"
              animate={isHovered ? "visible" : "hidden"}
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.05
                  }
                }
              }}
            >
              {quiz.questionCount !== undefined && (
                <motion.div
                  className="flex items-center gap-1.5"
                  variants={{
                    hidden: { x: -5, opacity: 0.7 },
                    visible: { x: 0, opacity: 1 }
                  }}
                >
                  <FileText className="w-4 h-4" />
                  <span>{quiz.questionCount} questions</span>
                </motion.div>
              )}
              {quiz.lastAttempt && (
                <motion.div
                  className="flex items-center gap-1.5"
                  variants={{
                    hidden: { x: -5, opacity: 0.7 },
                    visible: { x: 0, opacity: 1 }
                  }}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Last: {new Date(quiz.lastAttempt).toLocaleDateString()}</span>
                </motion.div>
              )}
            </motion.div>

            {/* Action Button with magnetic effect */}
            <Link href={`/quizz/${quiz.id}`} className="block">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="neo"
                  className="w-full group/btn relative overflow-hidden"
                  size="lg"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover/btn:opacity-100"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative z-10">Start Quiz</span>
                  <motion.div
                    className="relative z-10"
                    animate={{
                      x: isHovered ? 4 : 0
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20
                    }}
                  >
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </motion.div>
                </Button>
              </motion.div>
            </Link>
          </div>

          {/* Decorative corner gradient with animation */}
          <motion.div
            className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-blue-500/10 via-purple-500/5 to-transparent rounded-tl-full"
            animate={{
              scale: isHovered ? 1.5 : 1,
              opacity: isHovered ? 1 : 0
            }}
            transition={{ duration: 0.5 }}
          />

          {/* Shimmer effect on hover */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ x: "-100%", opacity: 0 }}
            animate={{
              x: isHovered ? "100%" : "-100%",
              opacity: isHovered ? 0.1 : 0
            }}
            transition={{ duration: 0.8 }}
          >
            <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white to-transparent dark:via-gray-300 skew-x-12" />
          </motion.div>
        </div>
      </motion.div>

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
