"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Download, FileText, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { incrementFreeTrials } from "@/app/actions/checkFreeTrials";
import FolderManager from "@/components/FolderManager";

export default function NotesRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [transcription, setTranscription] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    // Timer effect
    useEffect(() => {
        if (isRecording && !isPaused) {
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isRecording, isPaused]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                await transcribeAudio(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Could not access microphone. Please check your permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);
        }
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            if (isPaused) {
                mediaRecorderRef.current.resume();
                setIsPaused(false);
            } else {
                mediaRecorderRef.current.pause();
                setIsPaused(true);
            }
        }
    };

    const transcribeAudio = async (audioBlob: Blob) => {
        setIsProcessing(true);
        try {
            const formData = new FormData();
            formData.append("audio", audioBlob, "recording.webm");

            const response = await fetch("/api/transcribe", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setTranscription(prev => prev + (prev ? "\n\n" : "") + data.text);
            } else {
                const error = await response.json();
                console.error("Transcription error:", error);
                alert("Failed to transcribe audio. Please try again.");
            }
        } catch (error) {
            console.error("Error transcribing audio:", error);
            alert("An error occurred during transcription.");
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadNotes = () => {
        const blob = new Blob([transcription], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `notes-${new Date().toISOString().split("T")[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const generateQuizFromNotes = async () => {
        if (!transcription.trim()) {
            alert("Please record some notes first!");
            return;
        }

        if (!selectedFolderId) {
            alert("Please select a folder first!");
            return;
        }

        setIsGeneratingQuiz(true);
        try {
            const response = await fetch("/api/quizz/generate-from-notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    notes: transcription,
                    folderId: selectedFolderId,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                const quizzId = data.quizzId;

                await incrementFreeTrials();

                router.push(`/quizz/${quizzId}`);
            } else {
                const errorData = await response.json();
                console.error("API Error:", errorData);
                alert(errorData.error || "Failed to generate quiz");
            }
        } catch (error: any) {
            console.error("Error generating quiz:", error);
            alert(error.message || "An error occurred while generating the quiz.");
        } finally {
            setIsGeneratingQuiz(false);
        }
    };

    const clearNotes = () => {
        if (confirm("Are you sure you want to clear all notes?")) {
            setTranscription("");
            setRecordingTime(0);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6">
            {/* Folder Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-blue-500 dark:border-blue-600 p-6 shadow-lg">
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Step 1: Select or Create a Folder
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Organize your notes by subject or topic.
                    </p>
                </div>
                <FolderManager
                    onFolderSelect={setSelectedFolderId}
                    selectedFolderId={selectedFolderId}
                    showManagement={true}
                    requireSelection={true}
                />
            </div>

            {/* Recording Controls - Only shown when folder is selected */}
            {selectedFolderId && (
                <>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-purple-500 dark:border-purple-600 p-8 shadow-lg">
                        <div className="text-center space-y-6">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Step 2: Record Your Notes
                            </h3>

                            {/* Recording Timer */}
                            <div className="text-6xl font-mono font-bold text-gray-900 dark:text-gray-100">
                                {formatTime(recordingTime)}
                            </div>

                            {/* Recording Status */}
                            {isRecording && (
                                <div className="flex items-center justify-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${isPaused ? "bg-yellow-500" : "bg-red-500 animate-pulse"}`}></div>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {isPaused ? "Paused" : "Recording..."}
                                    </span>
                                </div>
                            )}

                            {/* Control Buttons */}
                            <div className="flex gap-4 justify-center">
                                {!isRecording ? (
                                    <Button
                                        onClick={startRecording}
                                        size="lg"
                                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 gap-2"
                                    >
                                        <Mic className="w-5 h-5" />
                                        Start Recording
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            onClick={pauseRecording}
                                            size="lg"
                                            variant="outline"
                                        >
                                            {isPaused ? "Resume" : "Pause"}
                                        </Button>
                                        <Button
                                            onClick={stopRecording}
                                            size="lg"
                                            className="bg-red-600 hover:bg-red-700 gap-2"
                                        >
                                            <Square className="w-5 h-5" />
                                            Stop & Transcribe
                                        </Button>
                                    </>
                                )}
                            </div>

                            {isProcessing && (
                                <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Transcribing audio...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Transcription Display */}
                    {transcription && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-green-500 dark:border-green-600 p-6 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <FileText className="w-6 h-6" />
                                    Your Notes
                                </h3>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={clearNotes}
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Clear
                                    </Button>
                                    <Button
                                        onClick={downloadNotes}
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6 max-h-96 overflow-y-auto">
                                <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                                    {transcription}
                                </p>
                            </div>

                            <Button
                                onClick={generateQuizFromNotes}
                                disabled={isGeneratingQuiz}
                                size="lg"
                                className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 gap-2"
                            >
                                {isGeneratingQuiz ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Generating Quiz...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="w-5 h-5" />
                                        Generate Quiz from Notes
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* Placeholder when no folder selected */}
            {!selectedFolderId && (
                <div className="bg-gray-100 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12">
                    <div className="text-center">
                        <Mic className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Please Select a Folder First
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Choose or create a folder above to start recording your notes.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
