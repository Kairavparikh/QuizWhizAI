"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, TrendingUp, AlertCircle, Brain, CheckCircle, Sparkles, Award, Target, BarChart3 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

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
}

export default function ClassAnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.classId as string;
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
    fetchClassData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const fetchClassData = async () => {
    try {
      const response = await fetch(`/api/classes/${classId}`);
      if (response.ok) {
        const data = await response.json();
        setClassData(data.class);
      }
    } catch (error) {
      console.error("Error fetching class:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/classes/${classId}/analytics`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Brain className="w-16 h-16 mx-auto mb-4 animate-pulse text-purple-600" />
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">Failed to load analytics</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

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

  return (
    <div className="max-w-[1600px] mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Button
            onClick={() => router.push(`/teacher/classes/${classId}`)}
            variant="outline"
            size="lg"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Class
          </Button>
          <div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100">
              Class Analytics Dashboard
            </h1>
            {classData && (
              <p className="text-gray-600 dark:text-gray-400 text-xl mt-2">
                {classData.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* A. Class Overview - Top Stats Summary Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Class Overview
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                <th className="text-left py-4 px-6 font-bold text-gray-700 dark:text-gray-300 text-lg">Metric</th>
                <th className="text-center py-4 px-6 font-bold text-gray-700 dark:text-gray-300 text-lg">Value</th>
                <th className="text-left py-4 px-6 font-bold text-gray-700 dark:text-gray-300 text-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="py-4 px-6 font-semibold text-gray-900 dark:text-gray-100">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Total Students
                  </div>
                </td>
                <td className="py-4 px-6 text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {analytics.studentCount}
                </td>
                <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                  Enrolled in class
                </td>
              </tr>

              <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="py-4 px-6 font-semibold text-gray-900 dark:text-gray-100">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    Quizzes Assigned
                  </div>
                </td>
                <td className="py-4 px-6 text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {analytics.totalAssignments}
                </td>
                <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                  Total assignments given
                </td>
              </tr>

              <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="py-4 px-6 font-semibold text-gray-900 dark:text-gray-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Quizzes Completed
                  </div>
                </td>
                <td className="py-4 px-6 text-center text-3xl font-bold text-green-600">
                  {analytics.quizzesCompleted}
                </td>
                <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                  {analytics.completionRate}% completion rate
                </td>
              </tr>

              <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="py-4 px-6 font-semibold text-gray-900 dark:text-gray-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Average Class Score
                  </div>
                </td>
                <td className="py-4 px-6 text-center text-3xl font-bold text-blue-600">
                  {analytics.averageClassScore}%
                </td>
                <td className="py-4 px-6">
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
                <td className="py-4 px-6 font-semibold text-gray-900 dark:text-gray-100">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-600" />
                    Class Mastery Level
                  </div>
                </td>
                <td className="py-4 px-6 text-center text-3xl font-bold">
                  <span className={getMasteryColor(analytics.classMasteryLevel)}>
                    {analytics.classMasteryLevel}
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                  Overall proficiency level
                </td>
              </tr>

              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="py-4 px-6 font-semibold text-gray-900 dark:text-gray-100">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-600" />
                    Confidence Accuracy
                  </div>
                </td>
                <td className="py-4 px-6 text-center text-3xl font-bold text-indigo-600">
                  {analytics.confidenceAccuracy}%
                </td>
                <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                  When confident, correct {analytics.confidenceAccuracy}% of the time
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* H. AI Teaching Recommendations */}
      {analytics.recommendations.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl border-2 border-purple-300 dark:border-purple-600 shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-600 rounded-full">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                AI Teaching Recommendations
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Actionable insights to improve class performance
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {analytics.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-4 py-1 rounded-full text-sm font-bold border-2 ${getPriorityColor(rec.priority)}`}>
                        {rec.priority} PRIORITY
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {rec.studentCount} student{rec.studentCount !== 1 ? 's' : ''} affected
                      </span>
                    </div>
                    <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      💡 {rec.action}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Topic: <span className="font-semibold">{rec.topic}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* D. Class Misconception Analysis */}
      {analytics.classMisconceptions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="w-8 h-8 text-orange-600" />
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Top Class Misconceptions
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Most common errors detected across all students
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {analytics.classMisconceptions.map((m, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border-2 border-orange-200 dark:border-orange-700 shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                      #{idx + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-2">
                        {m.type}
                      </h3>
                      <p className="text-base text-gray-700 dark:text-gray-300 mb-3">
                        <strong>Concept:</strong> {m.concept}
                      </p>
                      <div className="flex items-center gap-6 text-sm">
                        <span className="px-3 py-1 bg-white dark:bg-gray-700 rounded-full font-semibold text-gray-900 dark:text-gray-100">
                          {m.studentCount} student{m.studentCount !== 1 ? 's' : ''}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">
                          Avg Strength: <strong className="text-orange-600">{m.avgStrength}/10</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* E. Class Performance Over Time */}
      {analytics.performanceOverTime.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Class Performance Over Time
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Track progress and identify trends
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Date</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Avg Score</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Avg Confidence</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Submissions</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Trend</th>
                </tr>
              </thead>
              <tbody>
                {analytics.performanceOverTime.map((perf, idx) => {
                  const prevPerf = idx > 0 ? analytics.performanceOverTime[idx - 1] : null;
                  const scoreTrend = prevPerf ? perf.averageScore - prevPerf.averageScore : 0;

                  return (
                    <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-4 px-4 font-medium text-gray-900 dark:text-gray-100">
                        {new Date(perf.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`text-2xl font-bold ${
                          perf.averageScore >= 75 ? 'text-green-600' :
                          perf.averageScore >= 60 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {perf.averageScore}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-xl font-semibold text-blue-600">
                          {perf.averageConfidence}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-gray-700 dark:text-gray-300 font-semibold">
                        {perf.completionRate}
                      </td>
                      <td className="py-4 px-4">
                        {scoreTrend > 0 && (
                          <span className="flex items-center gap-1 text-green-600 font-semibold">
                            <TrendingUp className="w-4 h-4" />
                            +{scoreTrend}% Improving
                          </span>
                        )}
                        {scoreTrend < 0 && (
                          <span className="flex items-center gap-1 text-red-600 font-semibold">
                            <TrendingUp className="w-4 h-4 rotate-180" />
                            {scoreTrend}% Declining
                          </span>
                        )}
                        {scoreTrend === 0 && (
                          <span className="text-gray-500">
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
        </div>
      )}

      {/* Topic Mastery Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 p-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Topic Mastery Overview
        </h2>

        {analytics.topicMastery.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No quiz data yet. Students need to complete quizzes first.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Topic</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Mastery</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Students</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Active</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Resolving</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Resolved</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topicMastery.map((topic, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-4 px-4 font-medium text-gray-900 dark:text-gray-100">
                      {topic.topic}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${
                              topic.masteryScore < 40 ? 'bg-red-500' :
                              topic.masteryScore < 60 ? 'bg-orange-500' :
                              topic.masteryScore < 80 ? 'bg-blue-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${topic.masteryScore}%` }}
                          />
                        </div>
                        <span className="font-bold text-gray-900 dark:text-gray-100">
                          {topic.masteryScore}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center text-gray-700 dark:text-gray-300">
                      {topic.studentCount}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-semibold">
                        {topic.activeCount}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold">
                        {topic.resolvingCount}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold">
                        {topic.resolvedCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
