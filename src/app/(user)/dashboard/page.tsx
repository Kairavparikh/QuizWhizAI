import {db} from "@/db"
import {eq, sql, desc} from "drizzle-orm"
import {quizzes, questions, quizzSubmissions} from "@/db/schema"
import {auth} from "@/auth"
import QuizzesGrid from "./QuizzesGrid";
import getUserMetrics from "@/app/actions/getUserMetrics";
import getHeatMapData from "@/app/actions/getHeatMapData";
import updateExistingQuizzes from "@/app/actions/updateExistingQuizzes";
import MetricCard from "./metricCard";
import SubmissionsHeatMap from "./heatMap";
import { Button } from "@/components/ui/button";
import type { Quiz } from "./QuizCard";


const page = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return <p>User is not found.</p>;
  }

  // Fetch quizzes with question counts
  const userQuizzes = await db
    .select({
      id: quizzes.id,
      name: quizzes.name,
      description: quizzes.description,
      userId: quizzes.userId,
      questionCount: sql<number>`count(distinct ${questions.id})`.as('question_count'),
    })
    .from(quizzes)
    .leftJoin(questions, eq(quizzes.id, questions.quizzId))
    .where(eq(quizzes.userId, userId))
    .groupBy(quizzes.id)
    .orderBy(desc(quizzes.id));

  // Fetch last submission for each quiz
  const lastSubmissions = await db
    .select({
      quizzId: quizzSubmissions.quizzId,
      createdAt: sql<Date>`max(${quizzSubmissions.createdAt})`.as('last_attempt'),
    })
    .from(quizzSubmissions)
    .groupBy(quizzSubmissions.quizzId);

  // Merge the data
  const enrichedQuizzes: Quiz[] = userQuizzes.map(quiz => {
    const lastSubmission = lastSubmissions.find(sub => sub.quizzId === quiz.id);
    return {
      ...quiz,
      lastAttempt: lastSubmission?.createdAt || null,
    };
  });

  const userData = await getUserMetrics();
  const heatMapData = await getHeatMapData();
  console.log(heatMapData);
  return (
    <div className="space-y-8 pb-12">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {userData && userData.length > 0 &&
          userData.map((metric) => (
            <MetricCard key={metric.label} label={metric.label} value={metric.value} />
          ))
        }
      </div>

      {/* Heatmap */}
      {heatMapData && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Activity Overview
          </h2>
          <SubmissionsHeatMap data={heatMapData.data} />
        </div>
      )}

      {/* Quizzes Grid */}
      <QuizzesGrid quizzes={enrichedQuizzes} />

      {/* Database maintenance section - More subtle */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Don&apos;t see your Quiz?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Click below to refresh and sync your quizzes
            </p>
          </div>
          <form action={updateExistingQuizzes}>
            <Button type="submit" variant="outline" size="lg">
              Refresh Quizzes
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default page;