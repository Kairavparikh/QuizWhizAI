"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QuizzSubmission from "@/app/quizz/QuizzSubmission";
import { type ConfidenceLevel } from "@/lib/confidenceMapping";

type WrongAnswer = {
    questionText: string;
    userAnswer: string;
    correctAnswer: string;
    confidence: ConfidenceLevel;
    concept: string;
};

type AllAnswer = WrongAnswer & {
    isCorrect: boolean;
};

interface SubmissionData {
    score: number;
    scorePercentage: number;
    totalQuestions: number;
    wrongAnswers: WrongAnswer[];
    allAnswers: AllAnswer[];
    timeSpentInSeconds: number;
    questionsWithShuffledAnswers: any[];
    documentContent: string;
    quizzId: number;
}

export default function LatestSubmissionPage({
    params,
}: {
    params: { quizzId: string };
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submissionData, setSubmissionData] = useState<SubmissionData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubmission = async () => {
            try {
                const response = await fetch(`/api/quizz/${params.quizzId}/latest-submission`);

                if (!response.ok) {
                    if (response.status === 404) {
                        // No submission found, redirect to quiz
                        router.push(`/quizz/${params.quizzId}`);
                        return;
                    }
                    throw new Error("Failed to fetch submission");
                }

                const data = await response.json();
                const submission = data.submission;

                // Reconstruct the data needed for QuizzSubmission
                const score = submission.score || 0;
                const totalQuestions = submission.questionResponses?.length || 0;
                const scorePercentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

                const wrongAnswers: WrongAnswer[] = [];
                const allAnswers: AllAnswer[] = [];
                const questionsWithShuffledAnswers: any[] = [];

                submission.questionResponses?.forEach((qr: any) => {
                    if (!qr.question || !qr.selectedAnswer) return;

                    const correctAnswer = qr.question.answers.find((a: any) => a.isCorrect);
                    const confidence = (qr.confidence || "medium") as ConfidenceLevel;

                    const answerData: WrongAnswer = {
                        questionText: qr.question.questionText || "",
                        userAnswer: qr.selectedAnswer.answerText || "",
                        correctAnswer: correctAnswer?.answerText || "",
                        confidence: confidence,
                        concept: qr.question.questionText || "",
                    };

                    const allAnswerData: AllAnswer = {
                        ...answerData,
                        isCorrect: qr.isCorrect || false,
                    };

                    allAnswers.push(allAnswerData);

                    if (!qr.isCorrect) {
                        wrongAnswers.push(answerData);
                    }

                    // Add to questions array if not already present
                    if (!questionsWithShuffledAnswers.find(q => q.id === qr.question.id)) {
                        questionsWithShuffledAnswers.push({
                            id: qr.question.id,
                            questionText: qr.question.questionText,
                            answers: qr.question.answers,
                        });
                    }
                });

                setSubmissionData({
                    score,
                    scorePercentage,
                    totalQuestions,
                    wrongAnswers,
                    allAnswers,
                    timeSpentInSeconds: 0, // Not tracking this from database currently
                    questionsWithShuffledAnswers,
                    documentContent: "", // Fetch separately if needed
                    quizzId: parseInt(params.quizzId),
                });
            } catch (err: any) {
                console.error("Error fetching submission:", err);
                setError(err.message || "Failed to load submission");
            } finally {
                setLoading(false);
            }
        };

        fetchSubmission();
    }, [params.quizzId, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-900 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Loading your results...</p>
                </div>
            </div>
        );
    }

    if (error || !submissionData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-lg text-red-600">Error: {error || "Failed to load submission"}</p>
                    <button
                        onClick={() => router.push(`/quizz/${params.quizzId}`)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Go to Quiz
                    </button>
                </div>
            </div>
        );
    }

    return (
        <QuizzSubmission
            score={submissionData.score}
            scorePercentage={submissionData.scorePercentage}
            totalQuestions={submissionData.totalQuestions}
            wrongAnswers={submissionData.wrongAnswers}
            allAnswers={submissionData.allAnswers}
            timeSpentInSeconds={submissionData.timeSpentInSeconds}
            questionsWithShuffledAnswers={submissionData.questionsWithShuffledAnswers}
            documentContent={submissionData.documentContent}
            quizzId={submissionData.quizzId}
        />
    );
}
