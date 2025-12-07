"use client";
import{useState, useMemo, useEffect} from "react";
import {Button} from "@/components/ui/button";
import ProgressBar from "@/components/ui/progressBar";
import {ChevronLeft, X, Clock, Lightbulb, CheckCircle, Info, Sparkles} from "lucide-react"
import ResultCard from "./ResultCard"
import QuizzSubmission from "./QuizzSubmission"
import ConfidenceSelector from "./ConfidenceSelector"
import LearningStateFeedback from "./LearningStateFeedback"
import QuizTimer from "./QuizTimer"
import { InferSelectModel } from "drizzle-orm";
import {questionsAnswers, questions as DbQuestions, quizzes} from "@/db/schema";
import {useRouter, useSearchParams} from "next/navigation";
import { saveSubmission } from "../actions/saveSubmission";
import { saveAllQuestionResponses } from "../actions/saveQuestionResponse";
import { shuffleArray } from "@/lib/utils";
import { type ConfidenceLevel } from "@/lib/confidenceMapping";
import { motion, AnimatePresence } from "framer-motion";



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
    const[starting, setStarting] = useState(false); // New loading state for quiz start transition
    const[currentQuestion, setCurrentQuestion] = useState<number>(0);
    const [score, setScore] = useState<number>(0);
    const[userAnswers, setUserAnswers] = useState<{questionId:number, answerId:number, confidence: ConfidenceLevel | null}[]>([]);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [submittingMessage, setSubmittingMessage] = useState<string>("");
    const [selectedConfidence, setSelectedConfidence] = useState<ConfidenceLevel | null>(null);
    const [timerMinutes, setTimerMinutes] = useState<number>(5); // Default 5 minutes
    const [timeLeftInSeconds, setTimeLeftInSeconds] = useState<number>(5 * 60); // Will be set when quiz starts
    const [timerActive, setTimerActive] = useState<boolean>(false);
    const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
    const [quizEndTime, setQuizEndTime] = useState<number | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo');

    const submittingMessages = [
        "Saving your answers...",
        "Calculating your score...",
        "Analyzing your responses...",
        "Detecting misconceptions...",
        "Building your study plan...",
        "Preparing your review...",
        "Almost done..."
    ];

    useEffect(() => {
        if (!submitting) return;

        let messageIndex = 0;
        setSubmittingMessage(submittingMessages[0]);

        const interval = setInterval(() => {
            messageIndex = (messageIndex + 1) % submittingMessages.length;
            setSubmittingMessage(submittingMessages[messageIndex]);
        }, 1500);

        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [submitting]);

    const handleNext = () => {
        if(!started){
            setStarting(true); // Show loading transition
            // Simulate loading delay for smooth transition
            setTimeout(() => {
                setStarted(true);
                setStarting(false);
                setTimeLeftInSeconds(timerMinutes * 60); // Set timer when starting
                setTimerActive(true); // Activate timer
                setQuizStartTime(Date.now()); // Track start time
            }, 2000); // 2 second loading transition
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

        setSubmitting(true); // Start loading state
        setTimerActive(false); // Stop the timer
        setQuizEndTime(Date.now()); // Track end time
        const scorePercentage = Math.round((score / questions.length) * 100);
        try{
        const subId = await saveSubmission({score: scorePercentage}, props.quizz.id);
        console.log("Submission saved with ID:", subId, "Score:", scorePercentage + "%");

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

        // Trigger misconception analysis for each response
        for (const response of responsesToSave) {
            const question = questionsWithShuffledAnswers.find(q => q.id === response.questionId);
            if (!question) continue;

            const correctAnswerObj = question.answers.find(a => a.isCorrect);
            const userAnswerObj = question.answers.find(a => a.id === response.selectedAnswerId);

            // Analyze if wrong OR correct with low confidence (creates/updates misconceptions)
            if (!response.isCorrect || response.confidence === "low") {
                try {
                    await fetch('/api/misconception/analyze', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            questionId: response.questionId,
                            questionText: question.questionText || "",
                            correctAnswer: correctAnswerObj?.answerText || "",
                            userAnswer: userAnswerObj?.answerText || "",
                            allAnswerOptions: question.answers.map(a => a.answerText || ""),
                            confidence: response.confidence,
                            isCorrect: response.isCorrect,
                            folderId: props.quizz.folderId || undefined,
                        }),
                    });
                } catch (error) {
                    console.error("Error analyzing misconception:", error);
                    // Don't block quiz submission on misconception analysis failure
                }
            }

            // Update misconceptions if answered correctly with high confidence
            if (response.isCorrect && response.confidence === "high") {
                try {
                    await fetch('/api/misconception/update-on-correct', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            questionId: response.questionId,
                            confidence: response.confidence,
                        }),
                    });
                } catch (error) {
                    console.error("Error updating misconception on correct answer:", error);
                    // Don't block quiz submission on misconception update failure
                }
            }
        }
        console.log("Misconception analysis triggered");
        }
        catch(e){
            console.log("Error saving submission:", e);
        }

        // Stop the loading screen
        setSubmitting(false);

        // If this is an adaptive quiz with a returnTo parameter, redirect back to the original quiz's results
        if (returnTo) {
            router.push(`/quizz/${returnTo}/submission/latest`);
        } else {
            setSubmitted(true);
        }

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

    // Show loading screen while starting quiz
    if (starting) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                        <Sparkles className="w-24 h-24 mx-auto text-blue-600 dark:text-blue-400" />
                    </motion.div>
                    <motion.div
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Preparing Your Quiz...
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Get ready to test your knowledge!</p>
                    </motion.div>
                    <div className="flex gap-2 justify-center">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
                                animate={{ y: [0, -20, 0] }}
                                transition={{
                                    duration: 0.8,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                }}
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
        );
    }

    // Show loading screen while submitting
    if (submitting) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4 py-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-900"></div>
                <p className="text-2xl font-bold animate-pulse text-gray-900 dark:text-gray-100">{submittingMessage}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Please wait while we process your quiz...</p>
            </div>
        );
    }

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
            quizzId = {props.quizz.id}
                />
        )
    }
        return (
          <div className = "flex flex-col flex-1">
            <div className="sticky top-0 z-10 shadow-md py-4 w-full bg-white dark:bg-gray-900 flex justify-center px-6">
              <div className="w-full max-w-2xl">
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
            </div>
          <main className="flex justify-center flex-1 items-center px-6">
            {!started ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl w-full space-y-8"
                >
                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-center space-y-4"
                    >
                        <motion.div
                            animate={{
                                rotate: [0, 10, -10, 10, 0],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatDelay: 3
                            }}
                            className="inline-block p-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg"
                        >
                            <Lightbulb className="w-16 h-16 text-white" />
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {props.quizz.name || "Your Quiz"}
                        </h1>
                        {props.quizz.description && (
                            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                {props.quizz.description}
                            </p>
                        )}
                    </motion.div>

                    {/* Stats Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        <motion.div
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-xl border-2 border-blue-400"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
                            <div className="relative flex flex-col items-center text-center gap-3">
                                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                                    <Info className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <p className="text-5xl font-black text-white mb-1">{questions.length}</p>
                                    <p className="text-sm font-medium text-blue-100">Questions</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-xl border-2 border-purple-400"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
                            <div className="relative flex flex-col items-center text-center gap-3">
                                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                                    <Clock className="w-8 h-8 text-white" />
                                </div>
                                <div className="w-full">
                                    <input
                                        type="number"
                                        min="1"
                                        max="120"
                                        value={timerMinutes}
                                        onChange={(e) => setTimerMinutes(Math.max(1, parseInt(e.target.value) || 5))}
                                        className="w-20 text-5xl font-black text-white bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-xl px-2 py-1 text-center focus:outline-none focus:ring-4 focus:ring-white/50 mx-auto"
                                    />
                                    <p className="text-sm font-medium text-purple-100 mt-1">Minutes</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-xl border-2 border-green-400"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
                            <div className="relative flex flex-col items-center text-center gap-3">
                                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                                    <CheckCircle className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <p className="text-5xl font-black text-white mb-1">4</p>
                                    <p className="text-sm font-medium text-green-100">Choices Each</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Tips Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-2xl p-6 shadow-lg"
                    >
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                                    <Sparkles className="w-7 h-7 text-white" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100 mb-3">Tips for Success</h3>
                                <ul className="space-y-2">
                                    {[
                                        "Read each question carefully before answering",
                                        "Select your confidence level before choosing an answer",
                                        "You'll get personalized feedback based on your performance",
                                        "Watch the timer - quiz auto-submits when time runs out"
                                    ].map((tip, i) => (
                                        <motion.li
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 + i * 0.1 }}
                                            className="flex items-start gap-2 text-orange-800 dark:text-orange-200"
                                        >
                                            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-orange-600 dark:text-orange-400" />
                                            <span className="text-sm font-medium">{tip}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            ) : (
                <div className="w-full max-w-2xl space-y-6">
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
          <footer className = "footer pb-9 px-6 relative mb-0 flex justify-center">
            <div className="w-full max-w-2xl space-y-4">
              <ResultCard isCorrect = {isCorrect} correctAnswer = {questionsWithShuffledAnswers[currentQuestion].answers.find(answer => answer.isCorrect === true)?.answerText || ""}/>
                {
                    (currentQuestion === questions.length -1) ?
                        <Button
                            size="lg"
                            variant="neo"
                            onClick={handleSubmit}
                            disabled={!hasAnsweredCurrentQuestion}
                            className="w-full"
                        >
                            Submit
                        </Button> :
                        !started ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleNext}
                                    className="w-full py-4 text-xl font-bold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        Start Quiz
                                        <Sparkles className="w-6 h-6" />
                                    </span>
                                </motion.button>
                            </motion.div>
                        ) : (
                            <Button
                                size="lg"
                                variant="neo"
                                onClick={handleNext}
                                disabled={started && !hasAnsweredCurrentQuestion}
                                className="w-full"
                            >
                                Next
                            </Button>
                        )
                }
            </div>
          </footer>
          </div>
        )
}


