import { quizzes, questions, quizzSubmissions, users } from "@/db/schema";
import { auth } from "@/auth";
import { db } from "@/db";
import { avg, count, eq } from "drizzle-orm";

const getUserMetrics = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const numQuizzesResult = await db
    .select({ value: count() })
    .from(quizzes)
    .where(eq(quizzes.userId, userId));

  const numQuizzes = numQuizzesResult[0]?.value ?? 0;

  const numQuestionsResult = await db
    .select({ value: count() })
    .from(questions)
    .innerJoin(quizzes, eq(questions.quizzId, quizzes.id))
    .where(eq(quizzes.userId, userId));

  const numQuestions = numQuestionsResult[0]?.value ?? 0;


  const totalSubmissionsResult = await db
    .select({ value: count() })
    .from(quizzSubmissions)
    .innerJoin(quizzes, eq(quizzSubmissions.quizzId, quizzes.id))
    .where(eq(quizzes.userId, userId));

  const totalSubmissions = totalSubmissionsResult[0]?.value ?? 0;

  const avgScoreResult = await db
  .select({ value: avg(quizzSubmissions.score) })
  .from(quizzSubmissions)
  .innerJoin(quizzes, eq(quizzSubmissions.quizzId, quizzes.id))
  .innerJoin(users, eq(quizzes.userId, users.id))
  .where(eq(users.id, userId));


const avgScore = avgScoreResult[0]?.value ?? 0;

return [
  { label: "# of Quizzes", value: numQuizzes },
  { label: "# of Questions", value: numQuestions },
  { label: "# of Submissions", value: totalSubmissions },
  { label: "Average Score", value: avgScore },
];
};


export default getUserMetrics;
