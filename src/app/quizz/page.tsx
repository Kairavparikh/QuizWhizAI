"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/ui/progressBar";
import { ChevronLeft, X, Sparkles, Brain } from "lucide-react"
import ResultCard from "./ResultCard"
import QuizzSubmission from "./QuizzSubmission"
import { motion, AnimatePresence } from "framer-motion"
const questions= [
    {
        questionsText: "What is React?", 
        answers: [
            {answerText: "A library for building user interfaces",
                isCorrect: true, id:1},
            {answerText: "A backend formate",
                isCorrect: false, id:2},
            {answerText: "a front end framework",
                isCorrect: false, id:3},
            {answerText: "A database",
                isCorrect: false, id:4},
        ]
    },
    {
    questionsText: "What is JAX?", 
        answers: [
            {answerText: "JavaScript XML",
                isCorrect: true, id:1},
            {answerText: "JavaScript",
                isCorrect: false, id:2},
            {answerText: "JS and XML",
                isCorrect: false, id:3},
            {answerText: "JS and HTML",
                isCorrect: false, id:4},
        ]
    },
    {
    questionsText: "What is Virtual DOM?", 
        answers: [
            {answerText: "A virtual representation of the DOM",
                isCorrect: true, id:1},
            {answerText: "A real DOM",
                isCorrect: false, id:2},
            {answerText: "A virtual representation of the browser",
                isCorrect: false, id:3},
            {answerText: "A virtual representation of the server",
                isCorrect: false, id:4},
        ]
    }      

]
export default function Home(){
    const[started, setStarted]  = useState(false);
    const[currentQuestion, setCurrentQuestion] = useState<number>(0);
    const [score, setScore] = useState<number>(0);
    const[selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const[isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const handleNext = () => {
        if(!started){
            setStarted(true);
            return;
        }
        if(currentQuestion < questions.length -1 ){
            setCurrentQuestion(currentQuestion + 1);
        }
        else{
            setSubmitted(true);
            return;
        }
        setSelectedAnswer(null);
        setIsCorrect(null);
    }
    const handleAnswer = (answer: any) => {
        setSelectedAnswer(answer.id);
        const isCurrentCorrect = answer.isCorrect;
        if(isCurrentCorrect){
            setScore(score + 1)
        }
        setIsCorrect(isCurrentCorrect);
    }

    const scorePercentage: number = Math.round((score / questions.length) * 100);

    if(submitted){
        return(
            <QuizzSubmission
            score = {score}
            scorePercentage = {scorePercentage}
            totalQuestions = {questions.length}
                />
        )
    }
        return (
          <div className="flex flex-col flex-1 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 min-h-screen">
            {/* Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="sticky top-0 z-10 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 shadow-lg py-4 w-full border-b border-gray-200 dark:border-gray-700"
            >
              <header className="grid grid-cols-[auto,1fr,auto] grid-flow-col items-center justify-between py-2 gap-4 px-4 max-w-4xl mx-auto">
                <Button size="icon" variant="outline" className="hover:scale-110 transition-transform">
                  <ChevronLeft />
                </Button>
                <ProgressBar value={(currentQuestion / questions.length) * 100} />
                <Button size="icon" variant="outline" className="hover:scale-110 transition-transform">
                  <X />
                </Button>
              </header>
            </motion.div>

            {/* Main Content */}
            <main className="flex justify-center items-center flex-1 p-4">
              <AnimatePresence mode="wait">
                {!started ? (
                  <motion.div
                    key="start"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="text-center max-w-2xl"
                  >
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 10, 0],
                        scale: [1, 1.1, 1, 1.1, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                      className="inline-block mb-6"
                    >
                      <Brain className="w-24 h-24 text-purple-600 dark:text-purple-400" />
                    </motion.div>
                    <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Ready to Test Your Knowledge?
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                      Challenge yourself with {questions.length} questions and track your progress!
                    </p>
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Sparkles className="w-8 h-8 mx-auto text-yellow-500" />
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={currentQuestion}
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="w-full max-w-3xl"
                  >
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6"
                    >
                      <div className="flex items-start gap-4 mb-6">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0">
                          {currentQuestion + 1}
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                          {questions[currentQuestion].questionsText}
                        </h2>
                      </div>
                    </motion.div>

                    <div className="grid grid-cols-1 gap-4">
                      {questions[currentQuestion].answers.map((answer, index) => {
                        const variant = selectedAnswer === answer.id
                          ? (answer.isCorrect ? "neoSuccess" : "neoDanger")
                          : "neoOutline";

                        return (
                          <motion.div
                            key={answer.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 * index }}
                            whileHover={{ scale: selectedAnswer ? 1 : 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              variant={variant}
                              size="xl"
                              onClick={() => handleAnswer(answer)}
                              disabled={selectedAnswer !== null}
                              className="w-full text-left justify-start h-auto py-4 px-6"
                            >
                              <p className="whitespace-normal text-lg">{answer.answerText}</p>
                            </Button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            {/* Footer */}
            <motion.footer
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="pb-9 px-6 relative mb-0 max-w-4xl mx-auto w-full"
            >
              <ResultCard
                isCorrect={isCorrect}
                correctAnswer={questions[currentQuestion].answers.find(answer => answer.isCorrect === true)?.answerText || ""}
              />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  variant="neo"
                  onClick={handleNext}
                  className="w-full"
                >
                  {!started ? 'Start Quiz' : (currentQuestion === questions.length - 1) ? 'Submit' : 'Next Question'}
                </Button>
              </motion.div>
            </motion.footer>
          </div>
        )
}


