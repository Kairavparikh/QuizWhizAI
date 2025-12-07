"use client";

import { useState, useEffect } from "react";
import { MessageSquare, X, Clock, Sparkles, Brain, TrendingDown, TrendingUp, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Bar from "@/components/ui/bar";
import ReviewChatbot from "./ReviewChatbot";
import { type ConfidenceLevel } from "@/lib/confidenceMapping";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

type WrongAnswer = {
    questionText: string;
    userAnswer: string;
    correctAnswer: string;
    confidence: ConfidenceLevel;
    concept: string;
}

type AllAnswer = WrongAnswer & {
    isCorrect: boolean;
}

type Question = {
    id: number;
    questionText: string | null;
    answers: any[];
};

interface SmartReviewInterfaceProps {
    wrongAnswers: WrongAnswer[];
    allAnswers: AllAnswer[];
    questions: Question[];
    documentContent?: string | null;
    score: number;
    scorePercentage: number;
    totalQuestions: number;
    timeSpentInSeconds: number;
    onHandleBack: () => void;
    formatTime: (seconds: number) => string;
    quizzId?: number;
}

export default function SmartReviewInterface({
    wrongAnswers,
    allAnswers,
    questions,
    documentContent = "",
    score,
    scorePercentage,
    totalQuestions,
    timeSpentInSeconds,
    onHandleBack,
    formatTime,
    quizzId
}: SmartReviewInterfaceProps) {
    const router = useRouter();
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
    const [generatingAdaptiveQuiz, setGeneratingAdaptiveQuiz] = useState(false);

    // Calculate categories
    const reviewFirst = allAnswers.filter(a => !a.isCorrect && a.confidence === "high");
    const knowButDoubt = allAnswers.filter(a => a.isCorrect && (a.confidence === "low" || a.confidence === "medium"));
    const mastered = allAnswers.filter(a => a.isCorrect && a.confidence === "high");

    const handleGenerateAdaptiveQuiz = async () => {
        setGeneratingAdaptiveQuiz(true);
        try {
            const response = await fetch("/api/misconception/profile");
            if (!response.ok) throw new Error("Failed to fetch misconception profile");

            const profile = await response.json();
            const activeMisconceptions = profile.grouped.active || [];

            if (activeMisconceptions.length === 0) {
                alert("No active misconceptions found. Complete more questions to build your profile!");
                return;
            }

            const topMisconceptions = activeMisconceptions
                .sort((a: any, b: any) => b.strength - a.strength)
                .slice(0, 5)
                .map((m: any) => m.id);

            const quizResponse = await fetch("/api/misconception/generate-adaptive-quiz", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    misconceptionIds: topMisconceptions,
                    questionCount: Math.min(topMisconceptions.length * 3, 15),
                }),
            });

            if (!quizResponse.ok) throw new Error("Failed to generate adaptive quiz");

            const data = await quizResponse.json();
            const returnUrl = quizzId ? `/quizz/${data.quizzId}?returnTo=${quizzId}` : `/quizz/${data.quizzId}`;
            router.push(returnUrl);
        } catch (error) {
            console.error("Error generating adaptive quiz:", error);
            alert("Error generating adaptive quiz. Please try again.");
        } finally {
            setGeneratingAdaptiveQuiz(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            {/* Clean Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm"
            >
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                AI Study Assistant
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Review your quiz results and get personalized help
                            </p>
                        </div>
                    </div>
                    <Button onClick={onHandleBack} size="icon" variant="ghost">
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            </motion.div>

            <div className="max-w-7xl mx-auto px-6 py-8 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Chat Area - Takes 2/3 on large screens */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Compact Quiz Score Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    Quiz Results
                                </h2>
                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                    <Clock className="w-3 h-3" />
                                    <span>{formatTime(timeSpentInSeconds)}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        {scorePercentage}%
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Score</p>
                                </div>

                                <div className="flex gap-2 flex-1">
                                    <div className="flex-1">
                                        <Bar percentage={scorePercentage} color="green" />
                                    </div>
                                    <div className="flex-1">
                                        <Bar percentage={100 - scorePercentage} color="red" />
                                    </div>
                                </div>

                                <div className="flex gap-3 text-sm">
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-green-600 dark:text-green-400">{score}</div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Correct</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-red-600 dark:text-red-400">{totalQuestions - score}</div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Incorrect</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* AI Chat Interface */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <ReviewChatbot
                                questions={questions}
                                wrongAnswers={wrongAnswers}
                                selectedQuestionIndex={selectedQuestionIndex}
                                onQuestionSelect={setSelectedQuestionIndex}
                                documentContent={documentContent}
                            />
                        </motion.div>
                    </div>

                    {/* Sidebar - Takes 1/3 on large screens */}
                    <div className="space-y-6">
                        {/* Learning Categories */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
                        >
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Your Learning
                            </h3>

                            <div className="space-y-3">
                                {/* Review First */}
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border-2 border-red-200 dark:border-red-700">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                        <h4 className="font-bold text-red-800 dark:text-red-300">Review First</h4>
                                    </div>
                                    <p className="text-sm text-red-700 dark:text-red-400 mb-2">
                                        High-confidence wrong answers
                                    </p>
                                    <div className="text-2xl font-bold text-red-800 dark:text-red-300">
                                        {reviewFirst.length}
                                    </div>
                                    {reviewFirst.length > 0 && (
                                        <div className="mt-3 space-y-1 max-h-32 overflow-y-auto">
                                            {reviewFirst.slice(0, 3).map((ans, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        const wrongIdx = wrongAnswers.findIndex(
                                                            w => w.questionText === ans.questionText
                                                        );
                                                        setSelectedQuestionIndex(wrongIdx);
                                                    }}
                                                    className="w-full text-left text-xs text-red-700 dark:text-red-400 hover:underline truncate"
                                                >
                                                    • {ans.questionText.substring(0, 50)}...
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Know But Doubt */}
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border-2 border-yellow-200 dark:border-yellow-700">
                                    <div className="flex items-center gap-2 mb-2">
                                        <HelpCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                        <h4 className="font-bold text-yellow-800 dark:text-yellow-300">Know But Doubt</h4>
                                    </div>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-2">
                                        Low/medium confidence right answers
                                    </p>
                                    <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">
                                        {knowButDoubt.length}
                                    </div>
                                </div>

                                {/* Mastered */}
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border-2 border-green-200 dark:border-green-700">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        <h4 className="font-bold text-green-800 dark:text-green-300">Mastered</h4>
                                    </div>
                                    <p className="text-sm text-green-700 dark:text-green-400 mb-2">
                                        High confidence right answers
                                    </p>
                                    <div className="text-2xl font-bold text-green-800 dark:text-green-300">
                                        {mastered.length}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Adaptive Practice */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-700 shadow-lg"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                        Adaptive Practice
                                    </h3>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Target your weaknesses
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Generate a personalized quiz based on your detected misconceptions
                            </p>
                            <Button
                                onClick={handleGenerateAdaptiveQuiz}
                                disabled={generatingAdaptiveQuiz}
                                size="lg"
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
                            >
                                {generatingAdaptiveQuiz ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Generate Quiz
                                    </>
                                )}
                            </Button>
                        </motion.div>

                        {/* View Full Profile */}
                        <motion.a
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            href={`/dashboard/misconceptions${quizzId ? `?returnTo=${quizzId}` : ''}`}
                            className="block bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all group"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        View Full Misconception Profile
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Deep dive into your learning patterns
                                    </p>
                                </div>
                                <TrendingUp className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                            </div>
                        </motion.a>

                        {/* Questions to Review */}
                        {wrongAnswers.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
                            >
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                                    Questions to Review ({wrongAnswers.length})
                                </h3>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {wrongAnswers.map((wrongAnswer, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedQuestionIndex(index)}
                                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                                                selectedQuestionIndex === index
                                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                    selectedQuestionIndex === index
                                                        ? "bg-blue-500 text-white"
                                                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                                }`}>
                                                    {index + 1}
                                                </div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 flex-1">
                                                    {wrongAnswer.questionText}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
