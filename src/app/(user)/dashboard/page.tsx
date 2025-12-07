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
import DashboardContent from "./DashboardContent";


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

  return (
    <DashboardContent
      userData={userData}
      heatMapData={heatMapData}
      enrichedQuizzes={enrichedQuizzes}
    />
  );
};

export default page;
