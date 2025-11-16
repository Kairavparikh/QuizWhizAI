"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, ChevronRight, ArrowLeft, ArrowRight, X, Clock, Sparkles, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import Bar from "@/components/ui/bar";
import ReviewChatbot from "./ReviewChatbot";
import LearningStateFeedback from "./LearningStateFeedback";
import StudyPlan from "./StudyPlan";
import { type ConfidenceLevel } from "@/lib/confidenceMapping";
import { useRouter } from "next/navigation";

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
    const [selectedStudyCategory, setSelectedStudyCategory] = useState<string | null>(null);
    const [generatingAdaptiveQuiz, setGeneratingAdaptiveQuiz] = useState(false);
    const detailPanelRef = useRef<HTMLDivElement>(null);

    // Generate personalized summary based on quiz performance
    const generatePersonalizedSummary = () => {
        const total = allAnswers.length;
        if (total === 0) return "Complete your quiz to get personalized insights!";

        // Categorize all answers
        const highConfCorrect = allAnswers.filter(a => a.isCorrect && a.confidence === "high").length;
        const highConfWrong = allAnswers.filter(a => !a.isCorrect && a.confidence === "high").length;
        const lowConfCorrect = allAnswers.filter(a => a.isCorrect && (a.confidence === "low" || a.confidence === "medium")).length;
        const lowConfWrong = allAnswers.filter(a => !a.isCorrect && (a.confidence === "low" || a.confidence === "medium")).length;

        // Calculate percentages
        const percentHighConfCorrect = (highConfCorrect / total) * 100;
        const percentHighConfWrong = (highConfWrong / total) * 100;
        const percentLowConfCorrect = (lowConfCorrect / total) * 100;
        const percentLowConfWrong = (lowConfWrong / total) * 100;

        // Determine dominant pattern and return appropriate message
        if (percentLowConfCorrect > 40) {
            return "You're getting answers right but doubting yourself—work on building confidence in what you know!";
        } else if (percentHighConfWrong > 30) {
            return "You have some strong misconceptions to address—let's identify and correct those knowledge gaps!";
        } else if (percentHighConfCorrect > 60) {
            return "Strong performance! You demonstrate solid understanding and confidence in most topics.";
        } else if (percentLowConfWrong > 40) {
            return "Focus on reinforcing fundamentals—you're aware of gaps, now let's fill them with targeted practice!";
        } else if (highConfCorrect > lowConfWrong && highConfCorrect > highConfWrong) {
            return "You're showing good knowledge—continue building on your strengths while addressing weaker areas!";
        } else if (lowConfCorrect + lowConfWrong > highConfCorrect + highConfWrong) {
            return "You need more confidence across the board—deeper review will help solidify your understanding!";
        } else {
            return "Mixed results suggest reviewing both content knowledge and test-taking confidence!";
        }
    };

    // Handler for when a topic is clicked in the study plan
    const handleStudyTopicClick = (answerIndex: number, category: string) => {
        // Find the corresponding wrong answer index
        const answer = allAnswers[answerIndex];
        const wrongAnswerIndex = wrongAnswers.findIndex(
            wa => wa.questionText === answer.questionText && wa.confidence === answer.confidence
        );

        if (wrongAnswerIndex !== -1) {
            setSelectedQuestionIndex(wrongAnswerIndex);
            setSelectedStudyCategory(category);
        }
    };

    // Smooth scroll to detail panel when question is selected
    useEffect(() => {
        if (selectedQuestionIndex !== null && detailPanelRef.current) {
            detailPanelRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }, [selectedQuestionIndex]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (wrongAnswers.length === 0) return;

            if (e.key === "ArrowLeft" && selectedQuestionIndex !== null && selectedQuestionIndex > 0) {
                setSelectedQuestionIndex(selectedQuestionIndex - 1);
            } else if (e.key === "ArrowRight" && selectedQuestionIndex !== null && selectedQuestionIndex < wrongAnswers.length - 1) {
                setSelectedQuestionIndex(selectedQuestionIndex + 1);
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [selectedQuestionIndex, wrongAnswers.length]);

    const handlePrevQuestion = () => {
        if (selectedQuestionIndex !== null && selectedQuestionIndex > 0) {
            setSelectedQuestionIndex(selectedQuestionIndex - 1);
        }
    };

    const handleNextQuestion = () => {
        if (selectedQuestionIndex !== null && selectedQuestionIndex < wrongAnswers.length - 1) {
            setSelectedQuestionIndex(selectedQuestionIndex + 1);
        }
    };

    const handleGenerateAdaptiveQuiz = async () => {
        setGeneratingAdaptiveQuiz(true);
        try {
            // First, fetch the user's misconceptions from this quiz session
            const response = await fetch("/api/misconception/profile");
            if (!response.ok) {
                throw new Error("Failed to fetch misconception profile");
            }

            const profile = await response.json();

            // Get active misconceptions (exclude resolved ones)
            const activeMisconceptions = profile.grouped.active || [];

            if (activeMisconceptions.length === 0) {
                alert("No active misconceptions found. Complete more questions to build your profile!");
                return;
            }

            // Generate quiz targeting top 5 misconceptions or all if less than 5
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

            if (!quizResponse.ok) {
                throw new Error("Failed to generate adaptive quiz");
            }

            const data = await quizResponse.json();
            // Add returnTo parameter to navigate back after completing adaptive quiz
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
        <div className="flex flex-col flex-1">
            {/* Header - At the very top with X button */}
            <div className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 border-b border-blue-300 dark:border-blue-700 shadow-lg">
                <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-white" />
                        <div>
                            <h3 className="text-2xl font-bold text-white">
                                AI Study Assistant
                            </h3>
                            <p className="text-white/90 text-sm font-medium mt-1">
                                {generatePersonalizedSummary()}
                            </p>
                        </div>
                    </div>
                    <Button onClick={onHandleBack} size="icon" variant="outline" className="bg-white/10 hover:bg-white/20 border-white/20 text-white">
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            <div className="w-screen relative left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] pb-12">

            {/* Main Review Interface - Three Column Layout */}
            <div className="px-4 md:px-8 py-8">
                <div className="max-w-[2000px] mx-auto">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                        {/* LEFT: Study Plan (3/12 width on xl screens) */}
                        <div className="xl:col-span-3 order-1">
                            <div className="sticky top-4 space-y-4">
                                <StudyPlan
                                    allAnswers={allAnswers}
                                    onTopicClick={handleStudyTopicClick}
                                />

                                {/* Adaptive Quiz Generation Card */}
                                <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-700 shadow-lg">
                                    <div className="flex items-start gap-3 mb-4">
                                        <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">
                                                Adaptive Practice
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Generate a personalized quiz targeting your detected misconceptions
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleGenerateAdaptiveQuiz}
                                        disabled={generatingAdaptiveQuiz}
                                        size="lg"
                                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                                    >
                                        {generatingAdaptiveQuiz ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Generating Quiz...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5 mr-2" />
                                                Generate Adaptive Quiz
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                                        Powered by AI misconception analysis
                                    </p>
                                </div>

                                {/* View Full Misconception Profile Link */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                    <a
                                        href={`/dashboard/misconceptions${quizzId ? `?returnTo=${quizzId}` : ''}`}
                                        className="flex items-center justify-between text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    >
                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                            View Full Misconception Profile
                                        </span>
                                        <ChevronRight className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* MIDDLE: Chatbot - Main Focus (6/12 width on xl screens) */}
                        <div className="xl:col-span-6 order-2">
                            <div className="sticky top-4">
                                <ReviewChatbot
                                    questions={questions}
                                    wrongAnswers={wrongAnswers}
                                    selectedQuestionIndex={selectedQuestionIndex}
                                    onQuestionSelect={setSelectedQuestionIndex}
                                    documentContent={documentContent}
                                />
                            </div>
                        </div>

                        {/* RIGHT: Question Navigator (3/12 width on xl screens) */}
                        <div className="xl:col-span-3 order-3">
                            <div className="space-y-4">
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-4">
                                    <h4 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <ChevronRight className="w-5 h-5" />
                                        Questions to Review ({wrongAnswers.length})
                                    </h4>
                                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                                        {wrongAnswers.map((wrongAnswer, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedQuestionIndex(index)}
                                                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                                    selectedQuestionIndex === index
                                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                                                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm"
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                                        selectedQuestionIndex === index
                                                            ? "bg-blue-500 text-white"
                                                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                                    }`}>
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">
                                                            {wrongAnswer.questionText}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <span className={`px-2 py-0.5 rounded-full ${
                                                                wrongAnswer.confidence === "high"
                                                                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                                                    : wrongAnswer.confidence === "medium"
                                                                    ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                                                                    : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                                                            }`}>
                                                                {wrongAnswer.confidence} confidence
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Selected Question Detail */}
                                {selectedQuestionIndex !== null && (
                                    <div ref={detailPanelRef} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden transition-all duration-300">
                                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-white flex items-center gap-2">
                                                    <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">
                                                        {selectedQuestionIndex + 1}
                                                    </span>
                                                    Question Details
                                                </h4>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={handlePrevQuestion}
                                                        disabled={selectedQuestionIndex === 0}
                                                        className="p-1.5 rounded bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                                        title="Previous question (←)"
                                                    >
                                                        <ArrowLeft className="w-4 h-4 text-white" />
                                                    </button>
                                                    <button
                                                        onClick={handleNextQuestion}
                                                        disabled={selectedQuestionIndex === wrongAnswers.length - 1}
                                                        className="p-1.5 rounded bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                                        title="Next question (→)"
                                                    >
                                                        <ArrowRight className="w-4 h-4 text-white" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            <div>
                                                <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                                    Question:
                                                </h5>
                                                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                                    {wrongAnswers[selectedQuestionIndex].questionText}
                                                </p>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border-l-4 border-red-500">
                                                    <span className="font-semibold text-red-700 dark:text-red-400 block mb-1 text-xs">
                                                        Your Answer:
                                                    </span>
                                                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                                                        {wrongAnswers[selectedQuestionIndex].userAnswer}
                                                    </p>
                                                </div>
                                                <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border-l-4 border-green-500">
                                                    <span className="font-semibold text-green-700 dark:text-green-400 block mb-1 text-xs">
                                                        Correct Answer:
                                                    </span>
                                                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                                                        {wrongAnswers[selectedQuestionIndex].correctAnswer}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                                <LearningStateFeedback
                                                    isCorrect={false}
                                                    confidence={wrongAnswers[selectedQuestionIndex].confidence}
                                                    questionText={wrongAnswers[selectedQuestionIndex].questionText}
                                                    correctAnswer={wrongAnswers[selectedQuestionIndex].correctAnswer}
                                                    userAnswer={wrongAnswers[selectedQuestionIndex].userAnswer}
                                                    concept={wrongAnswers[selectedQuestionIndex].concept}
                                                    isVisible={true}
                                                    showFollowUp={false}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Score Summary - Below Questions */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
                                    <h4 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100 text-center">
                                        Quiz Results
                                    </h4>

                                    <div className="text-center mb-4">
                                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                            {scorePercentage}%
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Your Score
                                        </p>
                                    </div>

                                    <div className="flex flex-row gap-4 mb-4 justify-center">
                                        <Bar percentage={scorePercentage} color="green" />
                                        <Bar percentage={100 - scorePercentage} color="red" />
                                    </div>

                                    <div className="flex flex-row gap-6 justify-center mb-4 text-sm">
                                        <div className="text-center">
                                            <p className="font-bold text-green-600 dark:text-green-400">{score}</p>
                                            <p className="text-gray-600 dark:text-gray-400">Correct</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-red-600 dark:text-red-400">{totalQuestions - score}</p>
                                            <p className="text-gray-600 dark:text-gray-400">Incorrect</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Clock className="w-4 h-4" />
                                            <span>Time: {formatTime(timeSpentInSeconds)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}
