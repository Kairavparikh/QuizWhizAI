"use client";

import QuizCard, { type Quiz } from "./QuizCard";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";

type Props = {
  quizzes: Quiz[];
};

export default function QuizzesGrid({ quizzes: initialQuizzes }: Props) {
  const [quizzes, setQuizzes] = useState(initialQuizzes);

  const handleDeleteQuiz = (quizId: number) => {
    setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz.id !== quizId));
  };

  if (quizzes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative group rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50 overflow-hidden"
      >
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        <div className="relative max-w-md mx-auto space-y-6">
          <motion.div
            className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center"
            animate={{
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <PlusCircle className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </motion.div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              No quizzes yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get started by creating your first quiz. Upload a document or create one from scratch
            </p>
          </div>

          <Link href="/quizz/new">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="neo" size="lg" className="mt-4 group/btn">
                <PlusCircle className="w-5 h-5 mr-2 group-hover/btn:rotate-90 transition-transform duration-300" />
                Create Your First Quiz
              </Button>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-gray-200 dark:to-gray-100 bg-clip-text text-transparent">
            Your Quizzes
          </h2>
          <motion.p
            className="text-gray-600 dark:text-gray-400 text-sm mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {quizzes.length} {quizzes.length === 1 ? "quiz" : "quizzes"} available
          </motion.p>
        </div>

        <Link href="/quizz/new">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="neo" size="lg" className="group/btn">
              <motion.div
                className="mr-2"
                animate={{ rotate: 0 }}
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.3 }}
              >
                <PlusCircle className="w-5 h-5" />
              </motion.div>
              New Quiz
            </Button>
          </motion.div>
        </Link>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        {quizzes.map((quiz, index) => (
          <QuizCard key={quiz.id} quiz={quiz} onDelete={handleDeleteQuiz} index={index} />
        ))}
      </motion.div>
    </div>
  );
}
