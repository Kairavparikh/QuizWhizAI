"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  Users,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

interface Teacher {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

interface Quiz {
  id: number;
  name: string;
  description: string;
  questions: any[];
}

interface Submission {
  id: number;
  score: number;
  createdAt: string;
}

interface Assignment {
  id: number;
  quizId: number;
  dueDate: string | null;
  status: string;
  requireConfidence: boolean;
  createdAt: string;
  quiz: Quiz;
  completed: boolean;
  submission: Submission | null;
}

interface Class {
  id: number;
  name: string;
  subject: string;
  semester: string;
  description: string;
  joinCode: string;
  createdAt: string;
  teacher: Teacher;
  assignments: Assignment[];
}

interface ClassMembership {
  id: number;
  classId: number;
  studentId: string;
  joinedAt: string;
  class: Class;
}

export default function StudentClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/student/classes");
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
      } else {
        console.error("Failed to fetch classes");
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const getDaysUntilDue = (dueDate: string) => {
    const days = Math.ceil(
      (new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  const handleStartQuiz = (quizId: number) => {
    router.push(`/quizz/${quizId}`);
  };

  const totalAssignments = classes.reduce(
    (sum, membership) => sum + membership.class.assignments.length,
    0
  );
  const completedAssignments = classes.reduce(
    (sum, membership) =>
      sum + membership.class.assignments.filter((a) => a.completed).length,
    0
  );
  const overdueAssignments = classes.reduce(
    (sum, membership) =>
      sum +
      membership.class.assignments.filter(
        (a) => !a.completed && isOverdue(a.dueDate)
      ).length,
    0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
        <div className="relative">
          {/* Animated background circles */}
          <motion.div
            className="absolute -inset-20 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative flex flex-col items-center gap-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
          >
            {/* Animated icon */}
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="relative"
            >
              <GraduationCap className="w-20 h-20 text-blue-600 dark:text-blue-400" />
              <motion.div
                className="absolute inset-0"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="w-full h-full rounded-full bg-blue-400/30" />
              </motion.div>
            </motion.div>

            {/* Animated text */}
            <div className="text-center">
              <motion.h2
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2"
                animate={{
                  opacity: [1, 0.7, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                Loading Your Classes
              </motion.h2>
              <p className="text-gray-600 dark:text-gray-400">Please wait while we fetch your data...</p>
            </div>

            {/* Animated dots */}
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
                  animate={{
                    y: [0, -20, 0],
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            {/* Progress bar */}
            <div className="w-64 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Classes</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          View your enrolled classes and complete assignments
        </p>
      </div>

      {/* Stats Cards */}
      {classes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <GraduationCap className="w-4 h-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classes.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
              <BookOpen className="w-4 h-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAssignments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {completedAssignments}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {overdueAssignments}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Classes List */}
      {classes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">No Classes Yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You haven&apos;t joined any classes yet. Ask your teacher for a join code!
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => setShowJoinModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Users className="w-4 h-4 mr-2" />
                Join a Class
              </Button>
              <Button onClick={() => router.push("/dashboard")} variant="outline">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {classes.map((membership) => {
            const classData = membership.class;
            const activeAssignments = classData.assignments.filter(
              (a) => a.status === "active"
            );
            const completedCount = activeAssignments.filter((a) => a.completed).length;

            return (
              <Card key={classData.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{classData.name}</CardTitle>
                      <CardDescription className="text-base mt-1">
                        {classData.subject}{" "}
                        {classData.semester && `• ${classData.semester}`}
                      </CardDescription>
                      {classData.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {classData.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Teacher
                      </p>
                      <p className="font-medium">
                        {classData.teacher.name || "Anonymous"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4 text-sm">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {activeAssignments.length} assignment
                      {activeAssignments.length !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      {completedCount} completed
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {activeAssignments.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      No assignments yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeAssignments.map((assignment) => {
                        const overdue = isOverdue(assignment.dueDate);
                        const daysUntilDue = assignment.dueDate
                          ? getDaysUntilDue(assignment.dueDate)
                          : null;

                        return (
                          <div
                            key={assignment.id}
                            className={`p-4 border rounded-lg transition ${
                              assignment.completed
                                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                : overdue
                                ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                                : "hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold text-lg">
                                    {assignment.quiz.name || `Quiz #${assignment.quiz.id}`}
                                  </h3>
                                  {assignment.completed && (
                                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" />
                                      Completed
                                    </span>
                                  )}
                                  {!assignment.completed && overdue && (
                                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3" />
                                      Overdue
                                    </span>
                                  )}
                                </div>

                                {assignment.quiz.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {assignment.quiz.description}
                                  </p>
                                )}

                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <BookOpen className="w-4 h-4" />
                                    {assignment.quiz.questions?.length || 0} questions
                                  </span>

                                  {assignment.dueDate && (
                                    <span
                                      className={`flex items-center gap-1 ${
                                        overdue
                                          ? "text-red-600 dark:text-red-400 font-medium"
                                          : daysUntilDue !== null && daysUntilDue <= 3
                                          ? "text-orange-600 dark:text-orange-400 font-medium"
                                          : ""
                                      }`}
                                    >
                                      <Calendar className="w-4 h-4" />
                                      {overdue ? (
                                        `Overdue (${formatDate(assignment.dueDate)})`
                                      ) : daysUntilDue === 0 ? (
                                        "Due today"
                                      ) : daysUntilDue === 1 ? (
                                        "Due tomorrow"
                                      ) : (
                                        `Due ${formatDate(assignment.dueDate)}`
                                      )}
                                    </span>
                                  )}

                                  {assignment.completed && assignment.submission && (
                                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                                      Score: {assignment.submission.score}%
                                    </span>
                                  )}
                                </div>
                              </div>

                              <Button
                                onClick={() => handleStartQuiz(assignment.quiz.id)}
                                variant={assignment.completed ? "outline" : "default"}
                                className={
                                  !assignment.completed && overdue
                                    ? "bg-red-600 hover:bg-red-700"
                                    : ""
                                }
                              >
                                {assignment.completed ? "Review" : "Start Quiz"}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Join Class Modal */}
      {showJoinModal && (
        <JoinClassModal
          onClose={() => setShowJoinModal(false)}
          onSuccess={() => {
            setShowJoinModal(false);
            fetchClasses();
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
