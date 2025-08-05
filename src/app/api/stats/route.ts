import { db } from "@/db";
import { quizzSubmissions, questionsAnswers } from "@/db/schema";
import { sql } from "drizzle-orm"; // import sql helper

export async function GET() {
  // Total quizzes taken = count of rows in quizzSubmissions
  const totalQuizzesResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(quizzSubmissions)
    .execute();

  const totalQuizzesTaken = Number(totalQuizzesResult[0]?.count ?? 0);

  // Total questions answered = count of rows in questionsAnswers
  const totalQuestionsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(questionsAnswers)
    .execute();

  const totalQuestions = Number(totalQuestionsResult[0]?.count ?? 0);

  return new Response(
    JSON.stringify({ totalQuizzesTaken, totalQuestions }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
