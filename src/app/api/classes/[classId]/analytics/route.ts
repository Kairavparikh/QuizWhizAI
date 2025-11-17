import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { classes, classMembers, quizzes, quizzSubmissions, questionResponses, misconceptions, quizAssignments } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: { classId: string } }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const classId = parseInt(params.classId);

    // Verify teacher owns this class
    const classData = await db.query.classes.findFirst({
      where: eq(classes.id, classId),
    });

    if (!classData || classData.teacherId !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get all students in class
    const members = await db.query.classMembers.findMany({
      where: eq(classMembers.classId, classId),
      with: {
        student: true,
      },
    });

    const studentIds = members.map(m => m.studentId);

    if (studentIds.length === 0) {
      return NextResponse.json({
        studentCount: 0,
        students: [],
        classMisconceptions: [],
        topicMastery: [],
        learningStateDistribution: {},
        weaknessScore: {},
      });
    }

    // Get all misconceptions for students in this class
    const classMisconceptions = await db.query.misconceptions.findMany({
      where: inArray(misconceptions.userId, studentIds),
    });

    // Get all quiz submissions for students
    const studentQuizzes = await db.query.quizzes.findMany({
      where: inArray(quizzes.userId, studentIds),
      with: {
        submission: {
          with: {
            questionResponses: true,
          },
        },
      },
    });

    // Aggregate misconceptions by concept
    const misconceptionsByTopic: { [key: string]: any[] } = {};
    classMisconceptions.forEach(m => {
      const topic = m.concept.split(/[-–—:,\/]/)[0].trim();
      if (!misconceptionsByTopic[topic]) {
        misconceptionsByTopic[topic] = [];
      }
      misconceptionsByTopic[topic].push(m);
    });

    // Calculate topic mastery
    const topicMastery = Object.entries(misconceptionsByTopic).map(([topic, items]) => {
      const avgStrength = items.reduce((sum, m) => sum + m.strength, 0) / items.length;
      const masteryScore = Math.max(0, 100 - avgStrength * 10);

      const activeCount = items.filter(m => m.status === "active").length;
      const resolvingCount = items.filter(m => m.status === "resolving").length;
      const resolvedCount = items.filter(m => m.status === "resolved").length;

      return {
        topic,
        masteryScore: Math.round(masteryScore),
        avgStrength: Math.round(avgStrength * 10) / 10,
        studentCount: new Set(items.map(m => m.userId)).size,
        activeCount,
        resolvingCount,
        resolvedCount,
        totalMisconceptions: items.length,
      };
    }).sort((a, b) => a.masteryScore - b.masteryScore); // Lowest mastery first

    // Calculate learning state distribution
    const allResponses = studentQuizzes.flatMap(q =>
      q.submission.flatMap(s => s.questionResponses)
    );

    const learningStateDistribution = {
      HIGH_CONFIDENCE_WRONG: allResponses.filter(r => r.learningState === "HIGH_CONFIDENCE_WRONG").length,
      LOW_CONFIDENCE_WRONG: allResponses.filter(r => r.learningState === "LOW_CONFIDENCE_WRONG").length,
      LOW_CONFIDENCE_CORRECT: allResponses.filter(r => r.learningState === "LOW_CONFIDENCE_CORRECT").length,
      HIGH_CONFIDENCE_CORRECT: allResponses.filter(r => r.learningState === "HIGH_CONFIDENCE_CORRECT").length,
    };

    // Calculate weakness scores per topic
    const weaknessScoreByTopic: { [key: string]: number } = {};
    Object.entries(misconceptionsByTopic).forEach(([topic, items]) => {
      const highConfWrong = items.filter(m => m.strength >= 7).length;
      const medConfWrong = items.filter(m => m.strength >= 4 && m.strength < 7).length;
      const lowConfWrong = items.filter(m => m.strength < 4).length;

      weaknessScoreByTopic[topic] =
        (highConfWrong * 2.0) + (medConfWrong * 1.5) + (lowConfWrong * 1.0);
    });

    // Get top 5 common misconceptions
    const misconceptionCounts: { [key: string]: { count: number; concept: string; strength: number } } = {};
    classMisconceptions.forEach(m => {
      const key = m.misconceptionType;
      if (!misconceptionCounts[key]) {
        misconceptionCounts[key] = { count: 0, concept: m.concept, strength: 0 };
      }
      misconceptionCounts[key].count++;
      misconceptionCounts[key].strength += m.strength;
    });

    const topMisconceptions = Object.entries(misconceptionCounts)
      .map(([type, data]) => ({
        type,
        concept: data.concept,
        studentCount: data.count,
        avgStrength: Math.round((data.strength / data.count) * 10) / 10,
      }))
      .sort((a, b) => b.studentCount - a.studentCount)
      .slice(0, 5);

    // Generate AI teaching recommendations
    const recommendations = topicMasconceptions.map(m => {
      let priority: "CRITICAL" | "HIGH" | "MEDIUM" = "MEDIUM";
      let action = "";

      if (m.avgStrength >= 7) {
        priority = "CRITICAL";
        action = `Retest the class on "${m.concept}" — strong misconception detected`;
      } else if (m.avgStrength >= 4) {
        priority = "HIGH";
        action = `${Math.round((m.studentCount / studentIds.length) * 100)}% of students struggle with "${m.concept}" — assign review quiz`;
      } else {
        action = `Confidence is low on "${m.concept}" — consider reteaching the concept`;
      }

      return {
        topic: m.concept,
        misconceptionType: m.type,
        studentCount: m.studentCount,
        priority,
        action,
        avgStrength: m.avgStrength,
      };
    }).slice(0, 5);

    // Get class assignments and completion data
    const classAssignments = await db.query.quizAssignments.findMany({
      where: eq(quizAssignments.classId, classId),
      with: {
        quiz: {
          with: {
            questions: true,
          },
        },
      },
    });

    // Calculate assignment completion and average scores
    let totalAssignments = classAssignments.length;
    let completedAssignmentsCount = 0;
    let totalScore = 0;
    let totalScoreCount = 0;

    for (const assignment of classAssignments) {
      const submissions = await db.query.quizzSubmissions.findMany({
        where: eq(quizzSubmissions.quizzId, assignment.quizId),
      });

      if (submissions.length > 0) {
        completedAssignmentsCount += submissions.length;
        submissions.forEach(sub => {
          totalScore += sub.score;
          totalScoreCount++;
        });
      }
    }

    const averageClassScore = totalScoreCount > 0 ? Math.round(totalScore / totalScoreCount) : 0;
    const completionRate = totalAssignments > 0
      ? Math.round((completedAssignmentsCount / (totalAssignments * studentIds.length)) * 100)
      : 0;

    // Calculate class mastery level based on average score
    let classMasteryLevel = "Beginner";
    if (averageClassScore >= 90) classMasteryLevel = "Mastery";
    else if (averageClassScore >= 75) classMasteryLevel = "Proficient";
    else if (averageClassScore >= 60) classMasteryLevel = "Developing";

    // Calculate confidence accuracy
    const totalConfidentCorrect = learningStateDistribution.HIGH_CONFIDENCE_CORRECT;
    const totalConfidentWrong = learningStateDistribution.HIGH_CONFIDENCE_WRONG;
    const confidenceAccuracy = (totalConfidentCorrect + totalConfidentWrong) > 0
      ? Math.round((totalConfidentCorrect / (totalConfidentCorrect + totalConfidentWrong)) * 100)
      : 0;

    // Performance over time (group submissions by date)
    const allSubmissions = await db.query.quizzSubmissions.findMany({
      where: inArray(quizzSubmissions.quizzId, classAssignments.map(a => a.quizId)),
      orderBy: (submissions, { asc }) => [asc(submissions.createdAt)],
      with: {
        questionResponses: true,
      },
    });

    // Group by date and calculate averages
    const performanceByDate: { [key: string]: { scores: number[], confidences: number[], total: number } } = {};
    allSubmissions.forEach(sub => {
      const date = new Date(sub.createdAt).toISOString().split('T')[0];
      if (!performanceByDate[date]) {
        performanceByDate[date] = { scores: [], confidences: [], total: 0 };
      }
      performanceByDate[date].scores.push(sub.score);
      performanceByDate[date].total++;

      // Calculate average confidence for this submission
      const responses = sub.questionResponses || [];
      const confidenceValues = responses.map(r => {
        switch(r.confidence) {
          case 'VERY_CONFIDENT': return 5;
          case 'CONFIDENT': return 4;
          case 'SOMEWHAT_CONFIDENT': return 3;
          case 'NOT_CONFIDENT': return 2;
          case 'GUESSING': return 1;
          default: return 3;
        }
      });
      if (confidenceValues.length > 0) {
        const avgConf = confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length;
        performanceByDate[date].confidences.push(avgConf);
      }
    });

    const performanceOverTime = Object.entries(performanceByDate)
      .map(([date, data]) => ({
        date,
        averageScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
        averageConfidence: data.confidences.length > 0
          ? Math.round((data.confidences.reduce((a, b) => a + b, 0) / data.confidences.length) * 20) // Convert to percentage
          : 0,
        completionRate: data.total,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      studentCount: members.length,
      students: members.map(m => ({
        id: m.student.id,
        name: m.student.name,
        email: m.student.email,
        joinedAt: m.joinedAt,
      })),
      classMisconceptions: topMisconceptions,
      topicMastery,
      learningStateDistribution,
      weaknessScoreByTopic,
      recommendations,
      totalQuizzesTaken: studentQuizzes.length,
      totalResponses: allResponses.length,
      // New comprehensive analytics
      totalAssignments,
      quizzesCompleted: totalScoreCount,
      averageClassScore,
      completionRate,
      classMasteryLevel,
      confidenceAccuracy,
      performanceOverTime,
    });
  } catch (e: any) {
    console.error("Error fetching class analytics:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
