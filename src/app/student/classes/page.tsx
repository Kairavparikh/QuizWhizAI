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
} from "lucide-react";

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading your classes...</div>
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
            <Button onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
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
    </div>
  );
}
