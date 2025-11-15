"use client";

import { type ConfidenceLevel } from "@/lib/confidenceMapping";
import { Flame, Search, Lightbulb, Brain, ChevronRight } from "lucide-react";

type Answer = {
    questionText: string;
    userAnswer: string;
    correctAnswer: string;
    confidence: ConfidenceLevel;
    concept: string;
    isCorrect: boolean;
};

interface StudyPlanProps {
    allAnswers: Answer[];
    onTopicClick?: (questionIndex: number, category: string) => void;
}

type StudyCategory = {
    title: string;
    description: string;
    icon: any;
    color: string;
    bgColor: string;
    borderColor: string;
    answers: Answer[];
    priority: number;
};

export default function StudyPlan({ allAnswers, onTopicClick }: StudyPlanProps) {
    // Categorize answers based on confidence + correctness
    const categories: StudyCategory[] = [
        {
            title: "🔥 Review First",
            description: "High-confidence wrong answers (misconceptions)",
            icon: Flame,
            color: "text-red-600 dark:text-red-400",
            bgColor: "bg-red-50 dark:bg-red-900/20",
            borderColor: "border-red-200 dark:border-red-800",
            answers: allAnswers.filter(a => !a.isCorrect && a.confidence === "high"),
            priority: 1,
        },
        {
            title: "🔍 Reinforce Topics",
            description: "Low/medium confidence wrong answers",
            icon: Search,
            color: "text-orange-600 dark:text-orange-400",
            bgColor: "bg-orange-50 dark:bg-orange-900/20",
            borderColor: "border-orange-200 dark:border-orange-800",
            answers: allAnswers.filter(a => !a.isCorrect && (a.confidence === "low" || a.confidence === "medium")),
            priority: 2,
        },
        {
            title: "💡 Know But Doubt",
            description: "Low/medium confidence right answers",
            icon: Lightbulb,
            color: "text-yellow-600 dark:text-yellow-400",
            bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
            borderColor: "border-yellow-200 dark:border-yellow-800",
            answers: allAnswers.filter(a => a.isCorrect && (a.confidence === "low" || a.confidence === "medium")),
            priority: 3,
        },
        {
            title: "🧠 Mastered",
            description: "High confidence right answers",
            icon: Brain,
            color: "text-green-600 dark:text-green-400",
            bgColor: "bg-green-50 dark:bg-green-900/20",
            borderColor: "border-green-200 dark:border-green-800",
            answers: allAnswers.filter(a => a.isCorrect && a.confidence === "high"),
            priority: 4,
        },
    ];

    const handleTopicClick = (answer: Answer, categoryTitle: string) => {
        if (onTopicClick) {
            // Find the index of this answer in the allAnswers array
            const index = allAnswers.findIndex(a =>
                a.questionText === answer.questionText &&
                a.confidence === answer.confidence
            );
            onTopicClick(index, categoryTitle);
        }
    };

    return (
        <div className="space-y-4">
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    📚 Your Personalized Study Plan
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Based on your performance, here&apos;s what to focus on
                </p>
            </div>

            {categories.map((category) => (
                <div
                    key={category.title}
                    className={`rounded-xl border-2 ${category.borderColor} ${category.bgColor} overflow-hidden`}
                >
                    {/* Category Header */}
                    <div className="p-4 border-b-2 border-current/10">
                        <div className="flex items-center gap-3 mb-1">
                            <category.icon className={`w-6 h-6 ${category.color}`} />
                            <h4 className={`font-bold text-lg ${category.color}`}>
                                {category.title}
                            </h4>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 ml-9">
                            {category.description}
                        </p>
                    </div>

                    {/* Topics List */}
                    <div className="p-3">
                        {category.answers.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic py-2 px-3">
                                No topics in this category
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {category.answers.map((answer, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleTopicClick(answer, category.title)}
                                        className="w-full text-left p-3 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all group"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1 mb-1">
                                                    {answer.concept}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                                    {answer.questionText}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Count Badge */}
                    {category.answers.length > 0 && (
                        <div className="px-4 pb-3">
                            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                {category.answers.length} {category.answers.length === 1 ? "topic" : "topics"}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
