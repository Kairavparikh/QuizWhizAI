import {db} from "@/db"
import {quizzes, questions as dbQuestions, questionsAnswers, users} from "@/db/schema"
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { isContext } from "vm";
import { isNull } from "drizzle-orm";
import { sql } from "drizzle-orm";


type Quizz = InferInsertModel<typeof quizzes>;
type Question = InferInsertModel<typeof dbQuestions>;
type Answer = InferSelectModel<typeof questionsAnswers>;


interface SaveQuizzData extends Quizz{
    questions: Array<Question & {answers?: Answer[]}>;
}


export default async function saveQuizz(quizzData:SaveQuizzData, userId: string) {
    const {name, description, questions} = quizzData;
    const newQuizz = await db 
    .insert(quizzes)
    .values({
        name, 
        description,
        userId
    })
    .returning({
        insertedId: quizzes.id
    });
    const quizzId = newQuizz[0].insertedId;

    await db.transaction(async(tx) => {
        for(const question of questions){
            const [{questionId}] = await tx
            .insert 
        (dbQuestions)
        .values({
            questionText: question.questionText,
            quizzId
        })
        .returning({questionId: dbQuestions.id})
        if(question.answers && question.answers.length> 0){
            await tx.insert(questionsAnswers).values(
                question.answers.map((answer) => ({
                    answerText: answer.answerText,
                    isCorrect: answer.isCorrect,
                    questionId
                }))
            )
        }

        }

    })

    // Run database maintenance tasks automatically
    try {
        // 1. Update orphaned quizzes (quizzes without userId)
        await db
            .update(quizzes)
            .set({ userId })
            .where(isNull(quizzes.userId));

        // 2. Ensure freeTrialsUsed column exists and set default for new users
        await db.execute(sql`
            ALTER TABLE "user" 
            ADD COLUMN IF NOT EXISTS "free_trials_used" integer DEFAULT 0
        `);

        // 3. Update current user's freeTrialsUsed if they don't have the field
        await db.execute(sql`
            UPDATE "user" 
            SET "free_trials_used" = COALESCE("free_trials_used", 0) 
            WHERE "id" = ${userId}
        `);

    } catch (error) {
        console.error("Database maintenance error:", error);
        // Don't fail the quiz creation if maintenance fails
    }

    return {quizzId};
}