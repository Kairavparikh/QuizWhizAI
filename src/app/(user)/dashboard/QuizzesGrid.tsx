"use client";

import QuizCard, { type Quiz } from "./QuizCard";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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
      <div className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
            <PlusCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            No quizzes yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Get started by creating your first quiz. Upload a document or create one from scratch!
          </p>
          <Link href="/quizz/new">
            <Button variant="neo" size="lg" className="mt-4">
              <PlusCircle className="w-5 h-5 mr-2" />
              Create Your First Quiz
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Your Quizzes
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            {quizzes.length} {quizzes.length === 1 ? "quiz" : "quizzes"} available
          </p>
        </div>
        <Link href="/quizz/new">
          <Button variant="neo" size="lg">
            <PlusCircle className="w-5 h-5 mr-2" />
            New Quiz
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <QuizCard key={quiz.id} quiz={quiz} onDelete={handleDeleteQuiz} />
        ))}
      </div>
    </div>
  );
}
