"use client";
import{useState, useMemo, useEffect} from "react";
import {Button} from "@/components/ui/button";
import ProgressBar from "@/components/ui/progressBar";
import {ChevronLeft, X, Clock} from "lucide-react"
import ResultCard from "./ResultCard"
import QuizzSubmission from "./QuizzSubmission"
import ConfidenceSelector from "./ConfidenceSelector"
import LearningStateFeedback from "./LearningStateFeedback"
import QuizTimer from "./QuizTimer"
import { InferSelectModel } from "drizzle-orm";
import {questionsAnswers, questions as DbQuestions, quizzes} from "@/db/schema";
import {useRouter} from "next/navigation";
import { saveSubmission } from "../actions/saveSubmission";
import { saveAllQuestionResponses } from "../actions/saveQuestionResponse";
import { shuffleArray } from "@/lib/utils";
import { type ConfidenceLevel } from "@/lib/confidenceMapping";



type Answer = InferSelectModel<typeof questionsAnswers>;
type Question =InferSelectModel<typeof DbQuestions> & {answers: Answer[]};
type Quizz = InferSelectModel<typeof quizzes> & {questions: Question[]};


type Props = {
    quizz: Quizz
}




export default function QuizzQuestions(props: Props ){
    const{questions} = props.quizz;

    // Shuffle answers for each question once when component mounts
    const questionsWithShuffledAnswers = useMemo(() => {
        return questions.map(question => ({
            ...question,
            answers: shuffleArray(question.answers)
        }));
    }, [questions]);

    const[started, setStarted]  = useState(false);
    const[currentQuestion, setCurrentQuestion] = useState<number>(0);
    const [score, setScore] = useState<number>(0);
    const[userAnswers, setUserAnswers] = useState<{questionId:number, answerId:number, confidence: ConfidenceLevel | null}[]>([]);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [selectedConfidence, setSelectedConfidence] = useState<ConfidenceLevel | null>(null);
    const [timerMinutes, setTimerMinutes] = useState<number>(5); // Default 5 minutes
    const [timeLeftInSeconds, setTimeLeftInSeconds] = useState<number>(5 * 60); // Will be set when quiz starts
    const [timerActive, setTimerActive] = useState<boolean>(false);
    const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
    const [quizEndTime, setQuizEndTime] = useState<number | null>(null);
    const router = useRouter();

    const handleNext = () => {
        if(!started){
            setStarted(true);
            setTimeLeftInSeconds(timerMinutes * 60); // Set timer when starting
            setTimerActive(true); // Activate timer
            setQuizStartTime(Date.now()); // Track start time
            return;
        }

        // Validate that user has answered the current question
        const currentQuestionId = questionsWithShuffledAnswers[currentQuestion].id;
        const hasAnsweredCurrent = userAnswers.some(answer => answer.questionId === currentQuestionId);

        if (!hasAnsweredCurrent) {
            // Don't allow moving forward if current question hasn't been answered
            return;
        }

        if(currentQuestion < questions.length -1 ){
            setCurrentQuestion(currentQuestion + 1);
            setSelectedConfidence(null); // Reset confidence for next question
        }
        else{
            handleSubmit();
            return;
        }
    }

    const handleTimerTick = (newTime: number) => {
        setTimeLeftInSeconds(newTime);
    };

    const handleTimerExpire = () => {
        setTimerActive(false);
        // Auto-submit the quiz when timer expires
        if (!submitted) {
            handleSubmit();
        }
    };
    const handleAnswer = (answer: Answer, questionId: number) => {
        if (!selectedConfidence) return; // Require confidence selection

        const newUserAnswersArr = [...userAnswers, {
            answerId: answer.id,
            questionId,
            confidence: selectedConfidence
        }];
        setUserAnswers(newUserAnswersArr);
        const isCurrentCorrect = answer.isCorrect;
        if(isCurrentCorrect){
            setScore(score + 1)
        }
    }
    const handleSubmit = async() => {
        // Validate that the current question has been answered before submitting
        const currentQuestionId = questionsWithShuffledAnswers[currentQuestion].id;
        const hasAnsweredCurrent = userAnswers.some(answer => answer.questionId === currentQuestionId);

        if (!hasAnsweredCurrent) {
            // Don't allow submission if current question hasn't been answered
            return;
        }

        setTimerActive(false); // Stop the timer
        setQuizEndTime(Date.now()); // Track end time
        try{
        const subId = await saveSubmission({score}, props.quizz.id);
        console.log("Submission saved with ID:", subId);

        // Save all question responses with confidence data
        const responsesToSave = userAnswers.map((userAnswer) => {
            const question = questionsWithShuffledAnswers.find(q => q.id === userAnswer.questionId);
            const selectedAnswer = question?.answers.find(a => a.id === userAnswer.answerId);
            return {
                questionId: userAnswer.questionId,
                selectedAnswerId: userAnswer.answerId,
                confidence: userAnswer.confidence as ConfidenceLevel,
                isCorrect: selectedAnswer?.isCorrect || false,
                questionText: question?.questionText || "",
            };
        });

        await saveAllQuestionResponses(subId, responsesToSave);
        console.log("Question responses saved with confidence data");
        }
        catch(e){
            console.log("Error saving submission:", e);
        }
        setSubmitted(true);

    }
    const handlePressPrev = () => {
        if(currentQuestion !== 0){
            setCurrentQuestion(prevCurrentAuestion => prevCurrentAuestion - 1)
        }
    }

    const handleExit = () => {
        router.push('/dashboard');
    }
    const scorePercentage: number = Math.round((score / questions.length) * 100);
    const currentUserAnswer = userAnswers.find((item) => item.questionId === questionsWithShuffledAnswers[currentQuestion].id);
    const selectedAnswer: number | null | undefined = currentUserAnswer?.answerId;
    const currentConfidence: ConfidenceLevel | null | undefined = currentUserAnswer?.confidence || null;
    const selectedAnswerObj = questionsWithShuffledAnswers[currentQuestion].answers.find((answer) => answer.id === selectedAnswer);
    const isCorrect: boolean | null | undefined = selectedAnswerObj?.isCorrect ?? null;

    // Check if current question has been answered (both confidence and answer selected)
    const hasAnsweredCurrentQuestion = started && !!selectedAnswer && !!currentConfidence;

    // Build all answers array for study plan
    const allAnswers = userAnswers
        .map((userAnswer) => {
            const question = questionsWithShuffledAnswers.find(q => q.id === userAnswer.questionId);
            const selectedAnswerObj = question?.answers.find(a => a.id === userAnswer.answerId);
            const correctAnswerObj = question?.answers.find(a => a.isCorrect);

            if (question && question.questionText) {
                return {
                    questionText: question.questionText,
                    userAnswer: selectedAnswerObj?.answerText || "",
                    correctAnswer: correctAnswerObj?.answerText || "",
                    confidence: userAnswer.confidence as ConfidenceLevel,
                    concept: question.questionText.split(' ').slice(0, 5).join(' '),
                    isCorrect: selectedAnswerObj?.isCorrect || false,
                };
            }
            return null;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

    // Build wrong answers array for review section (backwards compatibility)
    const wrongAnswers = allAnswers.filter(answer => !answer.isCorrect);

    console.log("Current state - submitted:", submitted, "score:", score, "scorePercentage:", scorePercentage);

    // Calculate time spent
    const timeSpentInSeconds = quizStartTime && quizEndTime ? Math.floor((quizEndTime - quizStartTime) / 1000) : 0;

    if(submitted){
        return(
            <QuizzSubmission
            score = {score}
            scorePercentage = {scorePercentage}
            totalQuestions = {questions.length}
            wrongAnswers = {wrongAnswers}
            allAnswers = {allAnswers}
            timeSpentInSeconds = {timeSpentInSeconds}
            questionsWithShuffledAnswers = {questionsWithShuffledAnswers}
            documentContent = {props.quizz.documentContent || ""}
                />
        )
    }
        return (
          <div className = "flex flex-col flex-1">
            <div className="sticky top-0 z-10 shadow-md py-4 w-full bg-white dark:bg-gray-900">
            <header className = "grid grid-cols-[auto,1fr,auto] grid-flow-col items-center justify-between py-2 gap-2">
                <Button size = "icon" variant = "outline" onClick = {handlePressPrev}><ChevronLeft /></Button>
                <div className="flex flex-col gap-2">
                    <ProgressBar value={(currentQuestion / questions.length)*100}/>
                    {started && timerActive && (
                        <div className="flex justify-center">
                            <QuizTimer
                                timeLeftInSeconds={timeLeftInSeconds}
                                onTick={handleTimerTick}
                                onExpire={handleTimerExpire}
                            />
                        </div>
                    )}
                </div>
                <Button size = "icon" variant = "outline" onClick = {handleExit}><X /></Button>

                </header>
            </div>
          <main className="flex justify-center flex-1 items-center px-6">
            {!started ? (
                <div className="max-w-2xl w-full space-y-6">
                    <div className="text-center space-y-4">
                        <div className="inline-block p-4 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                            <svg className="w-16 h-16 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {props.quizz.name || "Your Quiz"}
                        </h1>
                        {props.quizz.description && (
                            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                                {props.quizz.description}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                            <div className="flex flex-col items-center text-center gap-3">
                                <div className="p-3 bg-blue-600 rounded-lg">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{questions.length}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Questions</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
                            <div className="flex flex-col items-center text-center gap-3">
                                <div className="p-3 bg-purple-600 rounded-lg">
                                    <Clock className="w-8 h-8 text-white" />
                                </div>
                                <div className="w-full">
                                    <input
                                        type="number"
                                        min="1"
                                        max="120"
                                        value={timerMinutes}
                                        onChange={(e) => setTimerMinutes(Math.max(1, parseInt(e.target.value) || 5))}
                                        className="w-16 text-3xl font-bold text-purple-600 dark:text-purple-400 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-600 rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-purple-500 mx-auto"
                                    />
                                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap mt-1">Minutes</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
                            <div className="flex flex-col items-center text-center gap-3">
                                <div className="p-3 bg-green-600 rounded-lg">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">4</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Choices Each</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mt-6">
                        <div className="flex gap-3">
                            <svg className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="font-semibold text-amber-800 dark:text-amber-300">Tips for Success</p>
                                <ul className="text-sm text-amber-700 dark:text-amber-400 mt-2 space-y-1">
                                    <li>• Read each question carefully before answering</li>
                                    <li>• Select your confidence level before choosing an answer</li>
                                    <li>• You&apos;ll get personalized feedback based on your performance</li>
                                    <li>• Watch the timer - quiz auto-submits when time runs out</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-3xl space-y-6">
                    <h2 className = "text-3xl font-bold">{questionsWithShuffledAnswers[currentQuestion].questionText}</h2>

                    {/* Confidence Selector - Show before answering */}
                    {!selectedAnswer && (
                        <ConfidenceSelector
                            onSelect={setSelectedConfidence}
                            disabled={!!selectedAnswer}
                            selectedConfidence={selectedConfidence}
                        />
                    )}

                    <div className = "grid grid-cols-1 gap-6 mt-6">
                    {
                        questionsWithShuffledAnswers[currentQuestion].answers.map
                        (answer => {
                            const variant = selectedAnswer === answer.id ? (answer.isCorrect ? "neoSuccess" : "neoDanger") : "neoOutline"
                            const isDisabled = !!selectedAnswer || !selectedConfidence;
                            return (<Button
                                key = {answer.id}
                                disabled = {isDisabled}
                                variant = {variant}
                                size = "xl"
                                onClick={() => handleAnswer(answer, questionsWithShuffledAnswers[currentQuestion].id)}
                                className = "disabled:opacity-100">
                                <p className = "whitespace-normal">{answer.answerText}</p>
                            </Button>
                        )
                        })
                    }
                    </div>

                    {/* Learning State Feedback - Show after answering (no follow-up during quiz) */}
                    {selectedAnswer && currentConfidence && isCorrect !== null && questionsWithShuffledAnswers[currentQuestion].questionText && (
                        <LearningStateFeedback
                            isCorrect={isCorrect}
                            confidence={currentConfidence}
                            questionText={questionsWithShuffledAnswers[currentQuestion].questionText}
                            correctAnswer={questionsWithShuffledAnswers[currentQuestion].answers.find(a => a.isCorrect)?.answerText || ""}
                            userAnswer={questionsWithShuffledAnswers[currentQuestion].answers.find(a => a.id === selectedAnswer)?.answerText || ""}
                            concept={questionsWithShuffledAnswers[currentQuestion].questionText.split(' ').slice(0, 5).join(' ')}
                            isVisible={true}
                            showFollowUp={false}
                        />
                    )}
                </div>
            )}
          </main>
          <footer className = "footer pb-9 px-6 relative mb-0">
            <ResultCard isCorrect = {isCorrect} correctAnswer = {questionsWithShuffledAnswers[currentQuestion].answers.find(answer => answer.isCorrect === true)?.answerText || ""}/>
                {
                    (currentQuestion === questions.length -1) ?
                        <Button
                            size="lg"
                            variant="neo"
                            onClick={handleSubmit}
                            disabled={!hasAnsweredCurrentQuestion}
                        >
                            Submit
                        </Button> :
                        <Button
                            size="lg"
                            variant="neo"
                            onClick={handleNext}
                            disabled={started && !hasAnsweredCurrentQuestion}
                        >
                            {!started ? 'Start' : 'Next'}
                        </Button>
                }

          </footer>
          </div>
        )
}


