import Bar from "@/components/ui/bar"
import Image from "next/image"
import {useReward} from "react-rewards";
import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button"
import {ChevronLeft, X, Clock} from "lucide-react"
import {useRouter} from "next/navigation";
import ProgressBar from "@/components/ui/progressBar";
import SmartReviewInterface from "./SmartReviewInterface";
import { type ConfidenceLevel } from "@/lib/confidenceMapping";

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

type Props = {
    scorePercentage: number,
    score: number,
    totalQuestions: number,
    wrongAnswers?: WrongAnswer[],
    allAnswers?: AllAnswer[],
    timeSpentInSeconds?: number,
    questionsWithShuffledAnswers?: any[],
    documentContent?: string | null
}
const QuizzSubmission = (props: Props) => {
    const {scorePercentage, score, totalQuestions, wrongAnswers = [], allAnswers = [], timeSpentInSeconds = 0, questionsWithShuffledAnswers = [], documentContent = ""} = props;
    const { reward } = useReward('rewardId', 'confetti');
    const router = useRouter();
    const [isGeneratingPractice, setIsGeneratingPractice] = useState(false);

    // Format time spent
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${String(secs).padStart(2, "0")}`;
    };

    useEffect(() => {
        if(scorePercentage === 100){
            reward();
        }
    }, [scorePercentage, reward])

    const onHandleBack = () => {
        router.back();
    }

    const handleGeneratePracticeQuiz = async () => {
        setIsGeneratingPractice(true);
        try {
            const response = await fetch('/api/quizz/generate-practice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                const data = await response.json();
                router.push(`/quizz/${data.quizzId}`);
            } else {
                console.error("Failed to generate practice quiz");
            }
        } catch (error) {
            console.error("Error generating practice quiz:", error);
        } finally {
            setIsGeneratingPractice(false);
        }
    }
    return(
        <div className = "flex flex-col flex-1">
            {/* Only show header and score section for perfect scores */}
            {scorePercentage === 100 && (
                <>
                    <div className="sticky top-0 z-10 shadow-md py-4 w-full">
                        <header className = "flex items-center justify-end py-2 gap-2">
                            <Button onClick = {onHandleBack} size = "icon" variant="outline">
                                <X />
                            </Button>
                        </header>
                    </div>
                    {/* Score Summary Section - Centered with max width */}
                    <div className="py-11 flex flex-col gap-4 items-center mt-24 px-6 max-w-4xl mx-auto w-full">
                        <h2 className = "text-3xl font-bold">Quiz Complete!</h2>
                        <p className="text-xl"> You Scored: {scorePercentage}%</p>

                        <div className = "flex flex-row gap-8 mt-6">
                            <Bar percentage = {scorePercentage} color = "green"></Bar>
                            <Bar percentage={100 - scorePercentage} color = "red"></Bar>
                        </div>
                        <div className = "flex flex-row gap-8 mb-2">
                            <p>{score} Correct</p>
                            <p>{totalQuestions - score} Incorrect</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
                            <Clock className="w-4 h-4" />
                            <span>Time Spent: {formatTime(timeSpentInSeconds)}</span>
                        </div>
                    </div>
                </>
            )}

                {scorePercentage === 100 && (
                    <div className = "flex flex-col items-center gap-6 w-full">
                        <p className="text-2xl font-semibold">Congratulations!🎉</p>
                        <div className = "flex justify center">
                            <Image src="/images/owl-smiling.png" alt="Smiling Image" width = {400} height = {400} />
                        </div>
                        <span id = "rewardId" />

                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 w-full">
                            <h3 className="text-xl font-bold mb-3 text-center">Ready for a Challenge?</h3>
                            <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
                                Since you aced this quiz, let&apos;s test your knowledge on topics you&apos;ve been working on!
                            </p>
                            <Button
                                onClick={handleGeneratePracticeQuiz}
                                disabled={isGeneratingPractice}
                                size="lg"
                                variant="neo"
                                className="w-full"
                            >
                                {isGeneratingPractice ? (
                                    <span className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Generating Practice Quiz...
                                    </span>
                                ) : (
                                    "Generate Practice Quiz (3 Questions)"
                                )}
                            </Button>
                        </div>
                    </div>
                )}

            {/* Smart Review Interface - Chatbot-Focused */}
            {scorePercentage !== 100 && (
                <SmartReviewInterface
                    wrongAnswers={wrongAnswers}
                    allAnswers={allAnswers}
                    questions={questionsWithShuffledAnswers}
                    documentContent={documentContent}
                    score={score}
                    scorePercentage={scorePercentage}
                    totalQuestions={totalQuestions}
                    timeSpentInSeconds={timeSpentInSeconds}
                    onHandleBack={onHandleBack}
                    formatTime={formatTime}
                />
            )}
        </div>
    )
}

export default QuizzSubmission;