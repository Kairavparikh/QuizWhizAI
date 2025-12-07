import React from 'react'
import { clsx } from "clsx"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, XCircle } from "lucide-react"

type Props = {
    isCorrect: boolean | null | undefined;
    correctAnswer: string
};

const ResultCard = (props: Props) => {
    const { isCorrect } = props;

    if (isCorrect === null || isCorrect === undefined) {
        return null
    }

    const text = isCorrect ? 'Correct!' : 'Incorrect! The correct answer is: ' + props.correctAnswer;

    const borderClasses = clsx({
        "border-green-500 bg-green-50 dark:bg-green-900/20": isCorrect,
        "border-red-500 bg-red-50 dark:bg-red-900/20": !isCorrect
    })

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={isCorrect ? "correct" : "incorrect"}
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: -20 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                className={cn(
                    borderClasses,
                    "border-2",
                    "rounded-xl",
                    "p-6",
                    "text-center",
                    "font-semibold",
                    "my-4",
                    "shadow-lg"
                )}
            >
                <div className="flex items-center justify-center gap-3">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    >
                        {isCorrect ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                        ) : (
                            <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        )}
                    </motion.div>
                    <motion.p
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.15 }}
                        className={cn(
                            "text-lg",
                            isCorrect ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
                        )}
                    >
                        {text}
                    </motion.p>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}

export default ResultCard;