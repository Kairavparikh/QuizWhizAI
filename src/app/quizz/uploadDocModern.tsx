"use client"
import {useState, useEffect} from "react";
import {Button} from "@/components/ui/button"
import {useRouter} from "next/navigation";
import { incrementFreeTrials } from "@/app/actions/checkFreeTrials";
import FolderManager from "@/components/FolderManager";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Sparkles, CheckCircle2, BookOpen, Users, GraduationCap, ArrowRight, X, ChevronLeft } from "lucide-react";

const UploadDocModern = () => {
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role;
    const isTeacher = userRole === "TEACHER";

    const[document, setDocument] = useState<File | null | undefined>(null);
    const[isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [loadingMessage, setLoadingMessage] = useState<string>("");
    const [loadingProgress, setLoadingProgress] = useState<number>(0);
    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
    const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
    const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdQuizId, setCreatedQuizId] = useState<number | null>(null);
    const [quizTitle, setQuizTitle] = useState<string>("");
    const [quizDescription, setQuizDescription] = useState<string>("");
    const [currentStep, setCurrentStep] = useState<number>(1); // Step 1: Upload, Step 2: Details
    const router = useRouter();

    const loadingSteps = [
        { message: "Uploading your document...", icon: Upload },
        { message: "Reading PDF content...", icon: FileText },
        { message: "Analyzing key concepts...", icon: Sparkles },
        { message: "Identifying important topics...", icon: BookOpen },
        { message: "Generating quiz questions...", icon: GraduationCap },
        { message: "Creating answer options...", icon: CheckCircle2 },
        { message: "Finalizing your quiz...", icon: Sparkles },
    ];

    // Fetch teacher's classes
    useEffect(() => {
        if (isTeacher) {
            fetchTeacherClasses();
        }
    }, [isTeacher]);

    const fetchTeacherClasses = async () => {
        try {
            const response = await fetch('/api/teacher/classes');
            if (response.ok) {
                const data = await response.json();
                setTeacherClasses(data.classes || []);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    useEffect(() => {
        if (!isLoading) return;

        let stepIndex = 0;
        setLoadingMessage(loadingSteps[0].message);
        setLoadingProgress(0);

        const interval = setInterval(() => {
            stepIndex = (stepIndex + 1) % loadingSteps.length;
            setLoadingMessage(loadingSteps[stepIndex].message);
            setLoadingProgress(((stepIndex + 1) / loadingSteps.length) * 100);
        }, 2500);

        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading]);

    const handleClassToggle = (classId: number) => {
        setSelectedClasses(prev =>
            prev.includes(classId)
                ? prev.filter(id => id !== classId)
                : [...prev, classId]
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) =>{
        e.preventDefault();
        if(!document){
            setError("Please upload a document");
            return;
        }

        if(isTeacher && !quizTitle.trim()) {
            setError("Please enter a quiz title");
            return;
        }

        setIsLoading(true);
        setError("");
        const formData = new FormData();
        formData.append("pdf", document as Blob);
        if (selectedFolderId) {
            formData.append("folderId", selectedFolderId.toString());
        }
        if (isTeacher && quizTitle) {
            formData.append("title", quizTitle);
        }
        if (isTeacher && quizDescription) {
            formData.append("description", quizDescription);
        }

        try{
            const res = await fetch("/api/quizz/generate",{
                method: "POST",
                body: formData
            })
         if(res.status === 200){
            const data = await res.json();
            const quizzId = data.quizzId;

            await incrementFreeTrials();

            // If teacher selected classes, assign the quiz
            if (isTeacher && selectedClasses.length > 0) {
                await assignQuizToClasses(quizzId, selectedClasses);
            }

            if (isTeacher) {
                setCreatedQuizId(quizzId);
                setShowSuccessModal(true);
            } else {
                router.push(`/quizz/${quizzId}`);
            }
         } else {
            const errorData = await res.json().catch(() => ({ error: "Unknown error occurred" }));
            console.error("API Error:", errorData);
            setError(errorData.error || `Failed to generate quiz (Status: ${res.status})`);
         }
        }
         catch(e: any){
            console.log("error while generating", e)
            setError(e.message || "An unexpected error occurred. Please try again.");
         }
         setIsLoading(false);
    }

    const assignQuizToClasses = async (quizId: number, classIds: number[]) => {
        try {
            for (const classId of classIds) {
                await fetch('/api/teacher/assign-quiz', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        quizId,
                        classId,
                    }),
                });
            }
        } catch (error) {
            console.error('Error assigning quiz to classes:', error);
        }
    };

    return(
        <div className="w-full max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center justify-center py-20"
                    >
                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 shadow-2xl border border-gray-200 dark:border-gray-800 max-w-lg w-full">
                            {/* Animated Icon */}
                            <motion.div
                                className="w-24 h-24 mx-auto mb-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center"
                                animate={{
                                    rotate: [0, 360],
                                    scale: [1, 1.1, 1],
                                }}
                                transition={{
                                    rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                                }}
                            >
                                <Sparkles className="w-12 h-12 text-white" />
                            </motion.div>

                            {/* Loading Message */}
                            <motion.p
                                key={loadingMessage}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xl font-semibold text-center text-gray-900 dark:text-gray-100 mb-6"
                            >
                                {loadingMessage}
                            </motion.p>

                            {/* Progress Bar */}
                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${loadingProgress}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>

                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
                                This may take a minute...
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Header */}
                        <div className="text-center mb-12">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.1 }}
                                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-6"
                            >
                                <Upload className="w-10 h-10 text-white" />
                            </motion.div>
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-gray-100 mb-4">
                                {isTeacher ? "Create a New Quiz" : "Upload Your Study Material"}
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                {isTeacher
                                    ? currentStep === 1
                                        ? "Upload course material to get started"
                                        : "Add details and assign to your classes"
                                    : "Upload a PDF and we'll generate personalized quiz questions"
                                }
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* TEACHER FLOW */}
                            {isTeacher ? (
                                <>
                                    {/* Step 1: Upload Document */}
                                    {currentStep === 1 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800"
                                        >
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                                                    <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                </div>
                                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                    Upload Document
                                                </h2>
                                            </div>

                                            <label
                                                htmlFor="document"
                                                className={`group relative flex flex-col items-center justify-center w-full h-80 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                                                    document
                                                        ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                                                        : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20'
                                                }`}
                                            >
                                                <div className="flex flex-col items-center justify-center text-center px-6">
                                                    {document ? (
                                                        <>
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center mb-4"
                                                            >
                                                                <CheckCircle2 className="w-10 h-10 text-white" />
                                                            </motion.div>
                                                            <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                                                {document.name}
                                                            </p>
                                                            <p className="text-base text-green-600 dark:text-green-400 mb-4">
                                                                Ready to continue
                                                            </p>
                                                            <Button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    setDocument(null);
                                                                }}
                                                                variant="outline"
                                                                className="text-sm"
                                                            >
                                                                Change file
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-20 h-20 text-gray-400 dark:text-gray-600 mb-4 group-hover:text-blue-500 transition-colors" />
                                                            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                                Click or drag to upload
                                                            </p>
                                                            <p className="text-base text-gray-500 dark:text-gray-400">
                                                                PDF or TXT files • Max 10MB
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                                <input
                                                    type="file"
                                                    id="document"
                                                    accept=".pdf,.txt"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    onChange={(e) => {
                                                        setDocument(e?.target?.files?.[0]);
                                                        setError(""); // Clear error when file is selected
                                                    }}
                                                />
                                            </label>

                                            {document && (
                                                <Button
                                                    type="button"
                                                    onClick={() => setCurrentStep(2)}
                                                    size="lg"
                                                    className="mt-6 w-full py-6 text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all"
                                                >
                                                    Continue to Quiz Details
                                                    <ArrowRight className="w-5 h-5 ml-2" />
                                                </Button>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* Step 2: Quiz Details and Class Selection */}
                                    {currentStep === 2 && (
                                        <>
                                            {/* Back Button */}
                                            <Button
                                                type="button"
                                                onClick={() => setCurrentStep(1)}
                                                variant="ghost"
                                                className="mb-4"
                                            >
                                                <ChevronLeft className="w-4 h-4 mr-2" />
                                                Back to Upload
                                            </Button>

                                            {/* Quiz Title and Description */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 }}
                                                className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800"
                                            >
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                                        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                        Quiz Details
                                                    </h2>
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                            Quiz Title *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={quizTitle}
                                                            onChange={(e) => setQuizTitle(e.target.value)}
                                                            placeholder="e.g., Chapter 5: Photosynthesis"
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                            required
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                            Description (Optional)
                                                        </label>
                                                        <textarea
                                                            value={quizDescription}
                                                            onChange={(e) => setQuizDescription(e.target.value)}
                                                            placeholder="Brief description of what this quiz covers..."
                                                            rows={3}
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>

                                            {/* Class Selection */}
                                            {teacherClasses.length > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.2 }}
                                                    className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800"
                                                >
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                                            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                        </div>
                                                        <div>
                                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                                Assign to Classes
                                                            </h2>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                Optional: Select classes to assign this quiz to
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {teacherClasses.map((cls) => (
                                                            <motion.button
                                                                key={cls.id}
                                                                type="button"
                                                                onClick={() => handleClassToggle(cls.id)}
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                className={`p-4 rounded-xl border-2 transition-all text-left ${
                                                                    selectedClasses.includes(cls.id)
                                                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                                                                        : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 hover:border-purple-300 dark:hover:border-purple-700'
                                                                }`}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex-1">
                                                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                                            {cls.name}
                                                                        </h3>
                                                                        {cls.subject && (
                                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                                {cls.subject}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    {selectedClasses.includes(cls.id) && (
                                                                        <CheckCircle2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                                                    )}
                                                                </div>
                                                            </motion.button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* Error Message */}
                                            {error && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl flex items-start gap-3"
                                                >
                                                    <X className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                                </motion.div>
                                            )}

                                            {/* Generate Button */}
                                            <Button
                                                size="lg"
                                                type="submit"
                                                className="w-full py-6 text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all"
                                            >
                                                <Sparkles className="w-5 h-5 mr-2" />
                                                Generate Quiz with AI
                                                <ArrowRight className="w-5 h-5 ml-2" />
                                            </Button>
                                        </>
                                    )}
                                </>
                            ) : (
                                /* STUDENT FLOW - ORIGINAL */
                                <>
                                    {/* Folder Selection (Students Only) */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800"
                                    >
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                Select Folder
                                            </h2>
                                        </div>
                                        <FolderManager
                                            onFolderSelect={setSelectedFolderId}
                                            selectedFolderId={selectedFolderId}
                                            showManagement={true}
                                            requireSelection={true}
                                        />
                                    </motion.div>

                                    {/* Document Upload (Students) */}
                                    {selectedFolderId && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800"
                                        >
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                                                    <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                </div>
                                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                    Upload Document
                                                </h2>
                                            </div>

                                            <label
                                                htmlFor="document"
                                                className={`group relative flex flex-col items-center justify-center w-full h-64 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                                                    document
                                                        ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                                                        : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20'
                                                }`}
                                            >
                                                <div className="flex flex-col items-center justify-center text-center px-6">
                                                    {document ? (
                                                        <>
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-4"
                                                            >
                                                                <CheckCircle2 className="w-8 h-8 text-white" />
                                                            </motion.div>
                                                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                                                {document.name}
                                                            </p>
                                                            <p className="text-sm text-green-600 dark:text-green-400">
                                                                Ready to generate quiz
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4 group-hover:text-blue-500 transition-colors" />
                                                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                                Click or drag to upload
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                PDF or TXT files
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                                <input
                                                    type="file"
                                                    id="document"
                                                    accept=".pdf,.txt"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    onChange={(e) => {
                                                        setDocument(e?.target?.files?.[0]);
                                                        setError(""); // Clear error when file is selected
                                                    }}
                                                />
                                            </label>

                                            {error && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mt-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl flex items-start gap-3"
                                                >
                                                    <X className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                                </motion.div>
                                            )}

                                            <Button
                                                size="lg"
                                                type="submit"
                                                disabled={!document}
                                                className="mt-6 w-full py-6 text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Sparkles className="w-5 h-5 mr-2" />
                                                Generate Quiz with AI
                                                <ArrowRight className="w-5 h-5 ml-2" />
                                            </Button>
                                        </motion.div>
                                    )}
                                </>
                            )}
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Modal for Teachers */}
            <AnimatePresence>
                {showSuccessModal && isTeacher && createdQuizId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowSuccessModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-gray-200 dark:border-gray-800"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Success Icon */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6"
                            >
                                <CheckCircle2 className="w-10 h-10 text-white" />
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-3xl font-black text-gray-900 dark:text-gray-100 text-center mb-3"
                            >
                                Quiz Created Successfully!
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-gray-600 dark:text-gray-400 text-center mb-8"
                            >
                                {selectedClasses.length > 0
                                    ? `Your quiz has been created and assigned to ${selectedClasses.length} class${selectedClasses.length > 1 ? 'es' : ''}.`
                                    : "Your quiz has been generated and is ready to use."
                                }
                            </motion.p>

                            <div className="space-y-3">
                                <Button
                                    onClick={() => router.push(`/quizz/${createdQuizId}/preview`)}
                                    className="w-full py-6 text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                                >
                                    <BookOpen className="w-5 h-5 mr-2" />
                                    Preview Quiz
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                                <Button
                                    onClick={() => router.push("/teacher/dashboard")}
                                    variant="outline"
                                    className="w-full py-6 text-base font-semibold border-2"
                                >
                                    <GraduationCap className="w-5 h-5 mr-2" />
                                    Back to Dashboard
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default UploadDocModern;
