"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BookOpen, BarChart3, Plus, Trash2, Calendar, CheckCircle2, XCircle, Brain, TrendingUp, AlertCircle, Sparkles, Award, Target } from "lucide-react";
import AssignQuizDialog from "./AssignQuizDialog";
import { AnnouncementModal } from "@/components/AnnouncementModal";
import { AnnouncementsHistory } from "@/components/AnnouncementsHistory";

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

interface Analytics {
  studentCount: number;
  students: any[];
  classMisconceptions: any[];
  topicMastery: any[];
  learningStateDistribution: any;
  weaknessScoreByTopic: any;
  recommendations: any[];
  totalQuizzesTaken: number;
  totalResponses: number;
  totalAssignments: number;
  quizzesCompleted: number;
  averageClassScore: number;
  completionRate: number;
  classMasteryLevel: string;
  confidenceAccuracy: number;
  performanceOverTime: any[];
  studentPerformanceByAssignment: any[];
}

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;

  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("students");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    fetchClassData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  useEffect(() => {
    if (activeTab === "analytics" && !analytics) {
      fetchAnalytics();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

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

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const response = await fetch(`/api/classes/${classId}/analytics`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        console.error("Failed to fetch analytics");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setAnalyticsLoading(false);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700";
    }
  };

  const getMasteryColor = (level: string) => {
    switch (level) {
      case "Mastery": return "text-green-600 dark:text-green-400";
      case "Proficient": return "text-blue-600 dark:text-blue-400";
      case "Developing": return "text-orange-600 dark:text-orange-400";
      default: return "text-red-600 dark:text-red-400";
    }
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Enrolled Students ({classData.members.length})</CardTitle>
                  <CardDescription>
                    Students who have joined this class
                  </CardDescription>
                </div>
                <AnnouncementModal classId={parseInt(classId)} className={classData.name} />
              </div>
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

          {/* Announcements History */}
          <div className="mt-6">
            <AnnouncementsHistory classId={parseInt(classId)} />
          </div>
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
          {analyticsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Brain className="w-16 h-16 mx-auto mb-4 animate-pulse text-purple-600" />
                <p className="text-lg text-gray-600 dark:text-gray-400">Loading analytics...</p>
              </div>
            </div>
          ) : !analytics ? (
            <Card>
              <CardContent className="py-16">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4" />
                  <p>Failed to load analytics. Please try again.</p>
                  <Button onClick={fetchAnalytics} className="mt-4">Retry</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* A. Class Overview - Top Stats Summary Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                    <CardTitle>Class Overview</CardTitle>
                  </div>
                  <CardDescription>Key performance metrics at a glance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Metric</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Value</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-purple-600" />
                              Total Students
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {analytics.studentCount}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            Enrolled in class
                          </td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                            <div className="flex items-center gap-2">
                              <Brain className="w-4 h-4 text-blue-600" />
                              Quizzes Assigned
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {analytics.totalAssignments}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            Total assignments given
                          </td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              Quizzes Completed
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center text-2xl font-bold text-green-600">
                            {analytics.quizzesCompleted}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {analytics.completionRate}% completion rate
                          </td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-blue-600" />
                              Average Class Score
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center text-2xl font-bold text-blue-600">
                            {analytics.averageClassScore}%
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span className={`font-semibold ${
                              analytics.averageClassScore >= 75 ? 'text-green-600' :
                              analytics.averageClassScore >= 60 ? 'text-orange-600' :
                              'text-red-600'
                            }`}>
                              {analytics.averageClassScore >= 75 ? 'Excellent' :
                               analytics.averageClassScore >= 60 ? 'Needs Improvement' :
                               'Struggling'}
                            </span>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-purple-600" />
                              Class Mastery Level
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center text-2xl font-bold">
                            <span className={getMasteryColor(analytics.classMasteryLevel)}>
                              {analytics.classMasteryLevel}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            Overall proficiency level
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-indigo-600" />
                              Confidence Accuracy
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center text-2xl font-bold text-indigo-600">
                            {analytics.confidenceAccuracy}%
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            When confident, correct {analytics.confidenceAccuracy}% of the time
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* H. AI Teaching Recommendations */}
              {analytics.recommendations.length > 0 && (
                <Card className="border-purple-300 dark:border-purple-600 border-2">
                  <CardHeader className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-600 rounded-full">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle>AI Teaching Recommendations</CardTitle>
                        <CardDescription>Actionable insights to improve class performance</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {analytics.recommendations.map((rec: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(rec.priority)}`}>
                                {rec.priority} PRIORITY
                              </span>
                              {rec.category && (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                  {rec.category}
                                </span>
                              )}
                            </div>
                            {rec.affectedStudents && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {rec.affectedStudents} student{rec.affectedStudents !== 1 ? 's' : ''} affected
                              </span>
                            )}
                          </div>
                          <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                            {rec.action}
                          </p>
                          {rec.suggestion && (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-600">
                              <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                                💡 Suggested Action:
                              </p>
                              <p className="text-sm text-blue-800 dark:text-blue-300">
                                {rec.suggestion}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}


              {/* E. Class Performance Over Time */}
              {analytics.performanceOverTime.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                      <div>
                        <CardTitle>Class Performance Over Time</CardTitle>
                        <CardDescription>Track progress and identify trends</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                            <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                            <th className="text-center py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Avg Score</th>
                            <th className="text-center py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Avg Confidence</th>
                            <th className="text-center py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Submissions</th>
                            <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Trend</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.performanceOverTime.map((perf: any, idx: number) => {
                            const prevPerf = idx > 0 ? analytics.performanceOverTime[idx - 1] : null;
                            const scoreTrend = prevPerf ? perf.averageScore - prevPerf.averageScore : 0;

                            return (
                              <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="py-3 px-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {new Date(perf.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <span className={`text-xl font-bold ${
                                    perf.averageScore >= 75 ? 'text-green-600' :
                                    perf.averageScore >= 60 ? 'text-orange-600' : 'text-red-600'
                                  }`}>
                                    {perf.averageScore}%
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <span className="text-lg font-semibold text-blue-600">
                                    {perf.averageConfidence}%
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-center text-sm text-gray-700 dark:text-gray-300 font-semibold">
                                  {perf.completionRate}
                                </td>
                                <td className="py-3 px-3 text-sm">
                                  {scoreTrend > 0 && (
                                    <span className="flex items-center gap-1 text-green-600 font-semibold">
                                      <TrendingUp className="w-3 h-3" />
                                      +{scoreTrend}% Improving
                                    </span>
                                  )}
                                  {scoreTrend < 0 && (
                                    <span className="flex items-center gap-1 text-red-600 font-semibold">
                                      <TrendingUp className="w-3 h-3 rotate-180" />
                                      {scoreTrend}% Declining
                                    </span>
                                  )}
                                  {scoreTrend === 0 && (
                                    <span className="text-gray-500 text-xs">
                                      Stable
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Student Performance by Assignment */}
              {analytics.studentPerformanceByAssignment && analytics.studentPerformanceByAssignment.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-6 h-6 text-indigo-600" />
                      <div>
                        <CardTitle>Student Performance by Assignment</CardTitle>
                        <CardDescription>Track individual student progress on each assignment</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {analytics.studentPerformanceByAssignment.map((assignment: any, idx: number) => (
                        <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {assignment.quizName || 'Untitled Quiz'}
                              </h3>
                              {assignment.dueDate && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">
                                {assignment.averageScore}%
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Class Average
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
                              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {assignment.completedCount}/{assignment.totalStudents}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Completion Rate</div>
                              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {assignment.completionRate}%
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Missing</div>
                              <div className="text-lg font-semibold text-red-600">
                                {assignment.totalStudents - assignment.completedCount}
                              </div>
                            </div>
                          </div>

                          {assignment.submissions.length > 0 && (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">Student</th>
                                    <th className="text-center py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">Score</th>
                                    <th className="text-right py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">Submitted</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {assignment.submissions
                                    .sort((a: any, b: any) => b.score - a.score)
                                    .map((sub: any, subIdx: number) => (
                                      <tr key={subIdx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="py-2 px-2 text-gray-900 dark:text-gray-100">
                                          {sub.studentName}
                                        </td>
                                        <td className="py-2 px-2 text-center">
                                          <span className={`px-3 py-1 rounded-full font-bold ${
                                            sub.score >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                            sub.score >= 75 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                            sub.score >= 60 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                          }`}>
                                            {sub.score}%
                                          </span>
                                        </td>
                                        <td className="py-2 px-2 text-right text-gray-600 dark:text-gray-400 text-xs">
                                          {new Date(sub.submittedAt).toLocaleDateString()}
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
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
