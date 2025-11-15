import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { db } from "@/db";
import { spacedRepetition, questions, quizzes } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and, lte } from "drizzle-orm";
import saveQuizz from "../generate/saveToDb";

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    // Fetch user's weak areas (priority 1-3) from spaced repetition
    const weakAreas = await db.query.spacedRepetition.findMany({
      where: and(
        eq(spacedRepetition.userId, userId),
        lte(spacedRepetition.priority, 3) // Priority 1-3 (weak areas)
      ),
      orderBy: (spacedRepetition, { asc }) => [asc(spacedRepetition.priority)],
      with: {
        question: true,
      },
      limit: 5, // Get top 5 weak concepts
    });

    if (weakAreas.length === 0) {
      return NextResponse.json(
        { error: "No weak areas found. Complete more quizzes first!" },
        { status: 400 }
      );
    }

    // Extract concepts for practice
    const concepts = weakAreas.map(area => area.concept).join(", ");
    const sampleQuestions = weakAreas
      .map(area => area.question?.questionText)
      .filter(Boolean)
      .slice(0, 3)
      .join("\n");

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-4o",
    });

    const prompt = `Based on the following concepts where the user needs practice: ${concepts}

Sample questions from their quiz history:
${sampleQuestions}

Generate a practice quiz with EXACTLY 3 questions that focus on these weak areas. Make the questions challenging but fair. Return JSON only that contains a quiz object with fields: name, description, and questions. The name should be "Practice Quiz: [Main Topic]" and description should mention it focuses on areas needing improvement. There must be exactly four answer options for each question. questions is an array of objects with fields: questionText, answers. The answers array contains objects with fields: answerText, isCorrect. Only one answer per question should have isCorrect: true. CRITICAL: Randomize the position of the correct answer - do NOT always place it first.`;

    const parser = new JsonOutputFunctionsParser();
    const extractionFunctionSchema = {
      name: "extractor",
      description: "extracts fields from the output",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                questionText: { type: "string" },
                answers: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      answerText: { type: "string" },
                      isCorrect: { type: "boolean" },
                    },
                    required: ["answerText", "isCorrect"],
                  },
                },
              },
              required: ["questionText", "answers"],
            },
          },
        },
        required: ["name", "description", "questions"],
      },
    };

    const runnable = model
      .bind({
        functions: [extractionFunctionSchema],
        function_call: { name: "extractor" },
      })
      .pipe(parser);

    const message = new HumanMessage({
      content: prompt,
    });

    const result: any = await runnable.invoke([message]);
    console.log("Generated practice quiz:", result);

    // Save the practice quiz to database
    const { quizzId } = await saveQuizz(result, userId);

    return NextResponse.json({ quizzId }, { status: 200 });
  } catch (e: any) {
    console.error("Error generating practice quiz:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
