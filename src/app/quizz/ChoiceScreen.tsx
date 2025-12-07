"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileText, Mic, ArrowRight, Users, X, Check } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

type ChoiceScreenProps = {
    isSubscribed?: boolean;
};

export default function ChoiceScreen({ isSubscribed }: ChoiceScreenProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);

    const userRole = (session?.user as any)?.role;
    const isTeacher = userRole === "TEACHER";

    // Show Take Notes and Join Class only for subscribed users or teachers
    const hasAccessToAllFeatures = isSubscribed || isTeacher;

    const options = [
        ...(hasAccessToAllFeatures ? [{
            title: "Take Notes",
            description: "Record your study session with live speech-to-text",
            icon: Mic,
            gradient: "from-purple-500 via-pink-500 to-rose-500",
            bgGradient: "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
            features: [
                "Live transcription as you speak",
                "Handle long recordings",
                "Download notes as PDF",
                "Generate quiz from your notes"
            ],
            path: "/quizz/new/notes",
            buttonText: "Start Recording"
        }] : []),
        {
            title: "Upload Document",
            description: "Upload a PDF and get AI-generated quiz questions instantly",
            icon: FileText,
            gradient: "from-green-500 via-emerald-500 to-teal-500",
            bgGradient: "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
            features: [
                "Upload any PDF document",
                "AI analyzes key concepts",
                "Get instant quiz questions",
                "Track your progress"
            ],
            path: "/quizz/new/upload",
            buttonText: "Upload PDF"
        },
        ...(hasAccessToAllFeatures && !isTeacher ? [{
            title: "Join a Class",
            description: "Enter a class code to join your teacher's class",
            icon: Users,
            gradient: "from-blue-500 via-indigo-500 to-purple-500",
            bgGradient: "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
            features: [
                "Join with a 6-digit code",
                "Access assigned quizzes",
                "See your class progress",
                "Track improvements"
            ],
            path: null,
            buttonText: "Join Class",
            isModal: true
        }] : [])
    ];

    const handleCardClick = (option: typeof options[0]) => {
        if (option.isModal) {
            setShowJoinModal(true);
        } else if (option.path) {
            router.push(option.path);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <motion.h1
                    className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-gray-200 dark:to-gray-100 bg-clip-text text-transparent"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    How would you like to create your quiz?
                </motion.h1>
                <motion.p
                    className="text-xl text-gray-600 dark:text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    Choose your preferred method to get started
                </motion.p>
            </motion.div>

            {/* Options Grid */}
            <div className={`grid grid-cols-1 ${options.length === 1 ? 'lg:grid-cols-1 max-w-2xl mx-auto' : options.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-8`}>
                {options.map((option, index) => {
                    const Icon = option.icon;
                    const isHovered = hoveredCard === index;

                    return (
                        <motion.div
                            key={option.title}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.5,
                                delay: index * 0.1 + 0.3,
                                ease: [0.22, 1, 0.36, 1]
                            }}
                            onHoverStart={() => setHoveredCard(index)}
                            onHoverEnd={() => setHoveredCard(null)}
                            onClick={() => handleCardClick(option)}
                            className="relative group cursor-pointer"
                        >
                            {/* Animated gradient border */}
                            <div className={`absolute -inset-[2px] bg-gradient-to-r ${option.gradient} rounded-3xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500`} />

                            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl border-2 border-transparent overflow-hidden transition-all duration-300 hover:shadow-2xl min-h-[500px] flex flex-col">
                                {/* Background gradient effect */}
                                <motion.div
                                    className={`absolute inset-0 bg-gradient-to-br ${option.bgGradient} opacity-0`}
                                    animate={{ opacity: isHovered ? 1 : 0 }}
                                    transition={{ duration: 0.3 }}
                                />

                                {/* Floating particles */}
                                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                    {[...Array(6)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className={`absolute w-2 h-2 bg-gradient-to-r ${option.gradient} rounded-full opacity-0`}
                                            animate={isHovered ? {
                                                y: [-20, -150],
                                                x: [Math.random() * 300, Math.random() * 300],
                                                opacity: [0, 0.4, 0],
                                            } : {}}
                                            transition={{
                                                duration: 2 + i * 0.3,
                                                repeat: Infinity,
                                                delay: i * 0.2
                                            }}
                                        />
                                    ))}
                                </div>

                                <div className="relative z-10 p-8 flex flex-col flex-1">
                                    {/* Icon */}
                                    <motion.div
                                        className={`w-20 h-20 bg-gradient-to-br ${option.gradient} rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg`}
                                        animate={{
                                            rotate: isHovered ? [0, -10, 10, 0] : 0,
                                            scale: isHovered ? 1.1 : 1,
                                        }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <Icon className="w-10 h-10 text-white" />
                                    </motion.div>

                                    {/* Title */}
                                    <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 text-center">
                                        {option.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
                                        {option.description}
                                    </p>

                                    {/* Features */}
                                    <motion.ul
                                        className="space-y-3 mb-6 flex-1"
                                        variants={{
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05
                                                }
                                            }
                                        }}
                                        initial="hidden"
                                        animate={isHovered ? "visible" : "hidden"}
                                    >
                                        {option.features.map((feature, i) => (
                                            <motion.li
                                                key={i}
                                                className="flex items-start gap-3"
                                                variants={{
                                                    hidden: { x: -10, opacity: 0.7 },
                                                    visible: { x: 0, opacity: 1 }
                                                }}
                                            >
                                                <motion.div
                                                    className={`rounded-full bg-gradient-to-r ${option.gradient} p-0.5`}
                                                    animate={{
                                                        scale: isHovered ? [1, 1.3, 1] : 1,
                                                    }}
                                                    transition={{
                                                        duration: 0.3,
                                                        delay: i * 0.05
                                                    }}
                                                >
                                                    <Check className="w-4 h-4 flex-shrink-0 text-white" />
                                                </motion.div>
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    {feature}
                                                </span>
                                            </motion.li>
                                        ))}
                                    </motion.ul>

                                    {/* Button */}
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="mt-auto"
                                    >
                                        <Button
                                            className={`w-full bg-gradient-to-r ${option.gradient} hover:shadow-xl text-white text-base py-6 rounded-xl font-bold shadow-lg transition-all relative overflow-hidden group/btn`}
                                        >
                                            <motion.div
                                                className="absolute inset-0 bg-white/20"
                                                initial={{ x: "-100%" }}
                                                whileHover={{ x: "100%" }}
                                                transition={{ duration: 0.5 }}
                                            />
                                            <span className="relative z-10">{option.buttonText}</span>
                                            <motion.div
                                                className="relative z-10"
                                                animate={{
                                                    x: isHovered ? 4 : 0
                                                }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 300,
                                                    damping: 20
                                                }}
                                            >
                                                <ArrowRight className="w-5 h-5 ml-2 inline" />
                                            </motion.div>
                                        </Button>
                                    </motion.div>
                                </div>

                                {/* Corner decoration */}
                                <motion.div
                                    className={`absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl ${option.gradient} opacity-0 rounded-tl-full`}
                                    animate={{
                                        opacity: isHovered ? 0.15 : 0,
                                        scale: isHovered ? 1.5 : 1,
                                    }}
                                    transition={{ duration: 0.3 }}
                                />

                                {/* Shimmer effect */}
                                <motion.div
                                    className="absolute inset-0 pointer-events-none"
                                    initial={{ x: "-100%", opacity: 0 }}
                                    animate={{
                                        x: isHovered ? "100%" : "-100%",
                                        opacity: isHovered ? 0.1 : 0
                                    }}
                                    transition={{ duration: 0.8 }}
                                >
                                    <div className={`h-full w-1/2 bg-gradient-to-r from-transparent via-white to-transparent dark:via-gray-300 skew-x-12`} />
                                </motion.div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Join Class Modal */}
            <AnimatePresence>
                {showJoinModal && (
                    <JoinClassModal
                        onClose={() => setShowJoinModal(false)}
                        onSuccess={() => {
                            setShowJoinModal(false);
                            router.push("/dashboard");
                        }}
                    />
                )}
            </AnimatePresence>
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
        <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-8 relative overflow-hidden"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20" />

                {/* Close button */}
                <motion.button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors z-10"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </motion.button>

                <div className="relative z-10">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center mb-6 mx-auto"
                    >
                        <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </motion.div>

                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
                        Join a Class
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
                        Enter the 6-digit code your teacher gave you
                    </p>

                    <form onSubmit={handleJoin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Class Code
                            </label>
                            <motion.input
                                type="text"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                className="w-full px-4 py-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800/50 text-center text-2xl font-bold tracking-widest transition-all"
                                placeholder="ABC123"
                                maxLength={6}
                                required
                                whileFocus={{ scale: 1.02 }}
                            />
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3"
                                >
                                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex gap-3 pt-4">
                            <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    type="button"
                                    onClick={onClose}
                                    variant="outline"
                                    className="w-full py-6 rounded-xl"
                                    disabled={joining}
                                >
                                    Cancel
                                </Button>
                            </motion.div>
                            <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-6 rounded-xl font-bold shadow-lg relative overflow-hidden"
                                    disabled={joining || joinCode.length !== 6}
                                >
                                    {joining && (
                                        <motion.div
                                            className="absolute inset-0 bg-white/20"
                                            animate={{ x: ["-100%", "100%"] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                        />
                                    )}
                                    <span className="relative z-10">
                                        {joining ? "Joining..." : "Join Class"}
                                    </span>
                                </Button>
                            </motion.div>
                        </div>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
}
