"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileText, Mic, ArrowRight } from "lucide-react";

export default function ChoiceScreen() {
    const router = useRouter();

    return (
        <div className="w-full max-w-5xl mx-auto px-6 md:px-8 lg:px-12 space-y-8">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    How would you like to create your quiz?
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Choose your preferred method to get started
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 w-full">
                {/* Take Notes Option */}
                <div
                    onClick={() => router.push("/quizz/new/notes")}
                    className="group relative bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl border-2 border-purple-200 dark:border-purple-700 p-8 md:p-12 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 min-h-[400px]"
                >
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="p-4 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                            <Mic className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Take Notes
                        </h3>

                        <p className="text-gray-600 dark:text-gray-400">
                            Record your study session with live speech-to-text. Perfect for lectures, readings, or voice notes.
                        </p>

                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 text-left w-full">
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                Live transcription as you speak
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                Handle long recordings
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                Download notes as text
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                Generate quiz from your notes
                            </li>
                        </ul>

                        <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white gap-2 group-hover:gap-4 transition-all"
                        >
                            Start Recording
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Take Quiz Option */}
                <div
                    onClick={() => router.push("/quizz/new/upload")}
                    className="group relative bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-2xl border-2 border-green-200 dark:border-green-700 p-8 md:p-12 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 min-h-[400px]"
                >
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="p-4 bg-green-100 dark:bg-green-900/40 rounded-full">
                            <FileText className="w-12 h-12 text-green-600 dark:text-green-400" />
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Upload Document
                        </h3>

                        <p className="text-gray-600 dark:text-gray-400">
                            Upload a PDF document and get AI-generated quiz questions instantly.
                        </p>

                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 text-left w-full">
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                Upload any PDF document
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                AI analyzes key concepts
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                Get instant quiz questions
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                Track your progress
                            </li>
                        </ul>

                        <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white gap-2 group-hover:gap-4 transition-all"
                        >
                            Upload PDF
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
