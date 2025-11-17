"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BookOpen, BarChart3, Plus, Trash2, Calendar, CheckCircle2, XCircle } from "lucide-react";
import AssignQuizDialog from "./AssignQuizDialog";

interface Student {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
}

interface Quiz {
  id: number;
  name: string;
  description: string;
  questions: any[];
}

interface Assignment {
  id: number;
  quizId: number;
  dueDate: string | null;
  status: string;
  requireConfidence: boolean;
  createdAt: string;
  quiz: Quiz;
}

interface ClassData {
  id: number;
  name: string;
  subject: string;
  semester: string;
  description: string;
  joinCode: string;
  createdAt: string;
  members: Array<{
    id: number;
    studentId: string;
    joinedAt: string;
    student: Student;
  }>;
  assignments: Assignment[];
}

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;

  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("students");

  useEffect(() => {
    fetchClassData();
  }, [classId]);

  const fetchClassData = async () => {
    try {
      const response = await fetch(`/api/classes/${classId}`);
      if (response.ok) {
        const data = await response.json();
        setClassData(data.class);
      } else {
        console.error("Failed to fetch class data");
      }
    } catch (error) {
      console.error("Error fetching class:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId: number) => {
    if (!confirm("Are you sure you want to remove this assignment?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/classes/${classId}/assign-quiz?assignmentId=${assignmentId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        fetchClassData();
      } else {
        alert("Failed to delete assignment");
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);
      alert("Failed to delete assignment");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading class details...</div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Class not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/teacher/dashboard")}
          className="mb-4"
        >
          ← Back to Dashboard
        </Button>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">{classData.name}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
              {classData.subject} {classData.semester && `• ${classData.semester}`}
            </p>
            {classData.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {classData.description}
              </p>
            )}
          </div>

          <Card className="md:w-64">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Join Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-wider text-center py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                {classData.joinCode}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                Students can use this code to join
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="w-4 h-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classData.members.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
            <BookOpen className="w-4 h-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classData.assignments.filter(a => a.status === "active").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
            <BarChart3 className="w-4 h-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classData.assignments.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="students">
            <Users className="w-4 h-4 mr-2" />
            Students
          </TabsTrigger>
          <TabsTrigger value="assignments">
            <BookOpen className="w-4 h-4 mr-2" />
            Assignments
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Students ({classData.members.length})</CardTitle>
              <CardDescription>
                Students who have joined this class
              </CardDescription>
            </CardHeader>
            <CardContent>
              {classData.members.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No students enrolled yet. Share the join code with your students!
                </div>
              ) : (
                <div className="space-y-3">
                  {classData.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {member.student.name?.[0] || member.student.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{member.student.name || "Anonymous"}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {member.student.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Joined {formatDate(member.joinedAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Quiz Assignments ({classData.assignments.length})</CardTitle>
                  <CardDescription>
                    Quizzes assigned to this class
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/quizz/new/upload")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Quiz
                  </Button>
                  <Button onClick={() => setShowAssignDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Assign Quiz
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {classData.assignments.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No Assignments Yet</h3>
                  <p className="text-gray-500 mb-6">
                    Create a quiz first, then assign it to this class
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => router.push("/quizz/new/upload")}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Quiz
                    </Button>
                    <Button onClick={() => setShowAssignDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Assign Existing Quiz
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {classData.assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {assignment.quiz.name || `Quiz #${assignment.quiz.id}`}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              assignment.status === "active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                            }`}
                          >
                            {assignment.status}
                          </span>
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
                                isOverdue(assignment.dueDate)
                                  ? "text-red-600 dark:text-red-400"
                                  : ""
                              }`}
                            >
                              <Calendar className="w-4 h-4" />
                              Due: {formatDate(assignment.dueDate)}
                              {isOverdue(assignment.dueDate) && " (Overdue)"}
                            </span>
                          )}

                          {assignment.requireConfidence && (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" />
                              Confidence tracking enabled
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-500 mt-2">
                          Assigned {formatDate(assignment.createdAt)}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Class Analytics</CardTitle>
              <CardDescription>
                Performance insights and misconception analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  View Comprehensive Analytics
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  View class-wide performance, common misconceptions, and learning patterns.
                </p>
                <Button
                  onClick={() => router.push(`/teacher/classes/${classId}/analytics`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Open Analytics Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assign Quiz Dialog */}
      {showAssignDialog && (
        <AssignQuizDialog
          classId={parseInt(classId)}
          onClose={() => setShowAssignDialog(false)}
          onAssigned={() => {
            fetchClassData();
            setShowAssignDialog(false);
          }}
        />
      )}
    </div>
  );
}
