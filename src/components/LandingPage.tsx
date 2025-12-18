"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRef, useState, useEffect } from "react";
import Footer from "@/components/Footer";
import {
  BookOpen,
  Brain,
  Users,
  GraduationCap,
  Sparkles,
  Zap,
  FileText,
  Mic,
  BarChart3,
  Target,
  Award,
  Rocket,
  CheckCircle2,
  ArrowRight,
  ChevronDown
} from "lucide-react";

type LandingPageProps = {
  isAuthenticated: boolean;
  userRole: string | null;
};

export default function LandingPage({ isAuthenticated, userRole }: LandingPageProps) {
  const [logoRevealed, setLogoRevealed] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const teacherRef = useRef(null);
  const studentRef = useRef(null);

  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });
  const teacherInView = useInView(teacherRef, { once: true, margin: "-100px" });
  const studentInView = useInView(studentRef, { once: true, margin: "-100px" });

  useEffect(() => {
    const timer = setTimeout(() => {
      setLogoRevealed(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Hero Section with Logo Animation */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
              initial={{
                x: Math.random() * 1200,
                y: Math.random() * 800,
              }}
              animate={{
                y: [null, -20, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Animated Logo Icon */}
        <motion.div
          className="absolute"
          style={{ left: "50%", top: "45%", transform: "translate(-50%, -50%)" }}
          initial={{ zIndex: 20 }}
          animate={{ zIndex: logoRevealed ? 0 : 20 }}
          transition={{ delay: logoRevealed ? 1.7 : 0 }}
        >
          {/* Brain Icon with Expanding Circles */}
          <motion.div
            className="relative flex items-center justify-center"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              duration: 1.5,
              ease: "easeOut",
              type: "spring",
              stiffness: 100
            }}
          >
            {/* Expanding Rings */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border-4 border-blue-500/30"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [1, 2.5 + i * 0.5],
                  opacity: [0.6, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeOut"
                }}
                style={{
                  width: "200px",
                  height: "200px",
                }}
              />
            ))}

            {/* Central Brain Icon */}
            <motion.div
              className="w-48 h-48 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(59, 130, 246, 0.5)",
                  "0 0 60px rgba(168, 85, 247, 0.8)",
                  "0 0 20px rgba(59, 130, 246, 0.5)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Brain className="w-24 h-24 text-white" />
            </motion.div>

            {/* Orbiting Sparkles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }}
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                  delay: (i * 8) / 8
                }}
              >
                <motion.div
                  style={{
                    position: "absolute",
                    left: Math.cos((i * Math.PI * 2) / 8) * 120,
                    top: Math.sin((i * Math.PI * 2) / 8) * 120,
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                >
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* QuizWhiz Brand Reveal */}
        <motion.div
          className="relative z-10 text-center px-4 flex flex-col items-center justify-between h-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: logoRevealed ? 1 : 0 }}
          transition={{ delay: 1.7, duration: 0.8 }}
        >
          {/* Title - Positioned Higher */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 2, duration: 0.8 }}
            className="mt-16 md:mt-20"
          >
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              QuizWhiz AI
            </h1>
          </motion.div>

          {/* Spacer for brain */}
          <div className="flex-1" />

          {/* Description and CTA - Positioned Lower */}
          <motion.div
            className="mb-32 md:mb-40"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 2.3, duration: 0.8 }}
          >
            <motion.p
              className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-300 mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 2.3, duration: 0.8 }}
            >
              Transform Learning with AI-Powered Quizzes
            </motion.p>

            <motion.p
              className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8 font-medium"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 2.6, duration: 0.8 }}
            >
              Upload documents, record notes, or create from scratch. QuizWhiz generates personalized quizzes instantly, helping students learn smarter and teachers teach better.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 2.9, duration: 0.8 }}
            >
              {!isAuthenticated ? (
                <Link href="/api/auth/signin">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg">
                      <Rocket className="w-5 h-5 mr-2" />
                      Get Started Free
                    </Button>
                  </motion.div>
                </Link>
              ) : (
                <Link href={userRole === "TEACHER" ? "/teacher/dashboard" : "/dashboard"}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg">
                      Go to Dashboard
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>
                </Link>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-gray-200 dark:to-gray-100 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Everything you need to master any subject
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: "Upload Documents",
                description: "Drop any PDF and get instant AI-generated questions",
                gradient: "from-green-500 to-emerald-600",
                delay: 0
              },
              {
                icon: Mic,
                title: "Voice Notes",
                description: "Record lectures with live transcription",
                gradient: "from-purple-500 to-pink-600",
                delay: 0.1
              },
              {
                icon: Brain,
                title: "AI-Powered",
                description: "Smart questions that adapt to your learning",
                gradient: "from-blue-500 to-indigo-600",
                delay: 0.2
              },
              {
                icon: BarChart3,
                title: "Track Progress",
                description: "Detailed analytics and misconception tracking",
                gradient: "from-orange-500 to-red-600",
                delay: 0.3
              },
              {
                icon: Target,
                title: "Spaced Repetition",
                description: "Remember more with scientifically-proven timing",
                gradient: "from-cyan-500 to-blue-600",
                delay: 0.4
              },
              {
                icon: Award,
                title: "Instant Feedback",
                description: "Get detailed explanations for every answer",
                gradient: "from-yellow-500 to-orange-600",
                delay: 0.5
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 50 }}
                  animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: feature.delay }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="relative group"
                >
                  <div className={`absolute -inset-[2px] bg-gradient-to-r ${feature.gradient} rounded-3xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500`} />

                  <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Teacher Mode Section */}
      <section ref={teacherRef} className="py-24 px-4 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={teacherInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={teacherInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 }}
              >
                <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full mb-6">
                  <GraduationCap className="w-5 h-5" />
                  <span className="font-semibold">For Teachers</span>
                </div>
              </motion.div>

              <motion.h2
                className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={teacherInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 }}
              >
                Empower Your Classroom
              </motion.h2>

              <motion.p
                className="text-xl text-gray-700 dark:text-gray-300 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={teacherInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 }}
              >
                Create unlimited classes, assign quizzes, and track student progress with powerful analytics.
              </motion.p>

              <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={teacherInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.5 }}
              >
                {[
                  "Create and manage unlimited classes",
                  "Assign custom quizzes to students",
                  "Track class-wide performance",
                  "Identify common misconceptions",
                  "Export detailed reports"
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={teacherInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.6 + i * 0.1 }}
                  >
                    <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <span className="text-lg text-gray-700 dark:text-gray-300">{item}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={teacherInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative"
            >
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Active Classes</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">12</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">248</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Quizzes Created</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">156</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -z-10 -top-6 -right-6 w-full h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl opacity-20" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Student Mode Section */}
      <section ref={studentRef} className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={studentInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={studentInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative lg:order-1 order-2"
            >
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Quizzes Taken</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">42</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Average Score</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">87%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Study Streak</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">7 days</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -z-10 -bottom-6 -left-6 w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl opacity-20" />
            </motion.div>

            <div className="lg:order-2 order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={studentInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 }}
              >
                <div className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-full mb-6">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">For Students</span>
                </div>
              </motion.div>

              <motion.h2
                className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={studentInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 }}
              >
                Learn Smarter, Not Harder
              </motion.h2>

              <motion.p
                className="text-xl text-gray-700 dark:text-gray-300 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={studentInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 }}
              >
                Join classes, create personalized quizzes, and master any subject with AI-powered learning.
              </motion.p>

              <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={studentInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.5 }}
              >
                {[
                  "Join classes with a simple code",
                  "Create unlimited practice quizzes",
                  "Voice-to-text note taking",
                  "Track your progress over time",
                  "Get instant AI feedback"
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={studentInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.6 + i * 0.1 }}
                  >
                    <CheckCircle2 className="w-6 h-6 text-purple-600 flex-shrink-0" />
                    <span className="text-lg text-gray-700 dark:text-gray-300">{item}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
  );
}
