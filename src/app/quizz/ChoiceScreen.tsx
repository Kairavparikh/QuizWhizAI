"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileText, Mic, ArrowRight, Users } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function ChoiceScreen() {
    const router = useRouter();
    const { data: session } = useSession();
    const [showJoinModal, setShowJoinModal] = useState(false);

    const userRole = (session?.user as any)?.role;
    const isTeacher = userRole === "TEACHER";

    return (
        <div className="w-full max-w-6xl mx-auto px-6 md:px-8 lg:px-12 space-y-8">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    How would you like to create your quiz?
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Choose your preferred method to get started
                </p>
            </div>

            <div className={`grid grid-cols-1 ${isTeacher ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-6 md:gap-8 w-full`}>
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

                {/* Join Class Option - Only for Students */}
                {!isTeacher && (
                    <div
                        onClick={() => setShowJoinModal(true)}
                        className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-700 p-8 md:p-12 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 min-h-[400px]"
                    >
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="p-4 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                                <Users className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Join a Class
                            </h3>

                            <p className="text-gray-600 dark:text-gray-400">
                                Enter a class code to join your teacher&apos;s class and access assigned quizzes.
                            </p>

                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 text-left w-full">
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    Join with a 6-digit code
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    Access assigned quizzes
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    See your class progress
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    Track improvements
                                </li>
                            </ul>

                            <Button
                                size="lg"
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-2 group-hover:gap-4 transition-all"
                            >
                                Join Class
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Join Class Modal */}
            {showJoinModal && (
                <JoinClassModal
                    onClose={() => setShowJoinModal(false)}
                    onSuccess={() => {
                        setShowJoinModal(false);
                        router.push("/dashboard");
                    }}
                />
            )}
        </div>
    );
}

// Join Class Modal Component
function JoinClassModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [joinCode, setJoinCode] = useState("");
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState("");

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setJoining(true);

        try {
            const response = await fetch("/api/classes/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ joinCode }),
            });

            const data = await response.json();

            if (response.ok) {
                onSuccess();
            } else {
                setError(data.error || "Failed to join class");
            }
        } catch (error) {
            console.error("Error joining class:", error);
            setError("An error occurred. Please try again.");
        } finally {
            setJoining(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Join a Class
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Enter the 6-digit code your teacher gave you
                </p>

                <form onSubmit={handleJoin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Class Code
                        </label>
                        <input
                            type="text"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 text-center text-2xl font-bold tracking-widest"
                            placeholder="ABC123"
                            maxLength={6}
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="outline"
                            className="flex-1"
                            disabled={joining}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            disabled={joining || joinCode.length !== 6}
                        >
                            {joining ? "Joining..." : "Join Class"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
