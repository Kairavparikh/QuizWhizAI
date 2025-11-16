import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { auth } from "@/auth";
import { db } from "@/db";
import { misconceptions, quizzes, questions, questionsAnswers, questionMisconceptions } from "@/db/schema";
import { eq, inArray, and } from "drizzle-orm";

interface GenerateAdaptiveQuizRequest {
  misconceptionIds: number[];
  questionCount?: number;
  folderId?: number;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const body: GenerateAdaptiveQuizRequest = await req.json();
    const { misconceptionIds, questionCount = 10, folderId } = body;

    if (!misconceptionIds || misconceptionIds.length === 0) {
      return NextResponse.json(
        { error: "At least one misconception ID is required" },
        { status: 400 }
      );
    }

    // Fetch the misconceptions
    const targetMisconceptions = await db.query.misconceptions.findMany({
      where: and(
        eq(misconceptions.userId, userId),
        inArray(misconceptions.id, misconceptionIds)
      ),
    });

    if (targetMisconceptions.length === 0) {
      return NextResponse.json(
        { error: "No valid misconceptions found" },
        { status: 404 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-4o",
      temperature: 0.7,
    });

    // Build prompt describing the misconceptions
    const misconceptionDescriptions = targetMisconceptions
      .map(
        (m, idx) =>
          `${idx + 1}. Concept: ${m.concept}
   Misconception: ${m.misconceptionType}
   Description: ${m.description}
   Strength: ${m.strength}/10`
      )
      .join("\n\n");

    const systemMessage = new SystemMessage({
      content: `You are an expert educational content creator specializing in adaptive learning.

Your task is to generate targeted quiz questions that specifically address the student's misconceptions.

For each misconception provided, create questions that:
1. Test understanding of the core concept
2. Present counterexamples to the misconception
3. Use analogies to clarify the concept
4. Include edge cases that reveal the misconception
5. Force the student to contrast correct vs incorrect thinking

Question types to use:
- Analogy questions (relate to familiar concepts)
- Counterexample questions (what does NOT fit this pattern?)
- Conceptual contrast (choose between similar but distinct concepts)
- Application questions (use the concept in a real scenario)
- Explanation questions (explain why something is true/false)

Return a JSON array of questions in this exact format:
[
  {
    "questionText": "The question text",
    "answers": [
      {"answerText": "Answer option 1", "isCorrect": true},
      {"answerText": "Answer option 2", "isCorrect": false},
      {"answerText": "Answer option 3", "isCorrect": false},
      {"answerText": "Answer option 4", "isCorrect": false}
    ],
    "targetMisconception": "Brief description of which misconception this targets",
    "questionType": "analogy | counterexample | contrast | application | explanation"
  }
]

IMPORTANT:
- Generate exactly ${questionCount} questions
- Distribute questions evenly across all provided misconceptions
- Make wrong answers plausible but clearly incorrect
- Ensure each question has exactly one correct answer
- Questions should be clear, concise, and educational`,
    });

    const userMessage = new HumanMessage({
      content: `Generate ${questionCount} adaptive quiz questions targeting these misconceptions:

${misconceptionDescriptions}

Return the questions as a JSON array.`,
    });

    const result = await model.invoke([systemMessage, userMessage]);
    const responseText = result.content.toString();

    // Extract JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response as JSON");
    }

    const generatedQuestions = JSON.parse(jsonMatch[0]);

    // Create a new quiz in the database
    const quizName = `Adaptive Quiz: ${targetMisconceptions.map((m) => m.concept).join(", ")}`;
    const quizDescription = `Targeted practice for ${targetMisconceptions.length} misconception(s)`;

    const [newQuiz] = await db
      .insert(quizzes)
      .values({
        name: quizName,
        description: quizDescription,
        userId,
        folderId: folderId || null,
        documentContent: `Adaptive quiz targeting misconceptions: ${targetMisconceptions
          .map((m) => m.misconceptionType)
          .join("; ")}`,
      })
      .returning();

    // Insert questions and answers
    for (let i = 0; i < generatedQuestions.length; i++) {
      const q = generatedQuestions[i];
      const [insertedQuestion] = await db
        .insert(questions)
        .values({
          questionText: q.questionText,
          quizzId: newQuiz.id,
        })
        .returning();

      // Insert answers
      for (const a of q.answers) {
        await db.insert(questionsAnswers).values({
          questionId: insertedQuestion.id,
          answerText: a.answerText,
          isCorrect: a.isCorrect,
        });
      }

      // Link this question to the targeted misconception
      // Distribute questions evenly across misconceptions
      const misconceptionIndex = i % targetMisconceptions.length;
      const targetMisconception = targetMisconceptions[misconceptionIndex];

      await db.insert(questionMisconceptions).values({
        questionId: insertedQuestion.id,
        misconceptionId: targetMisconception.id,
        relationshipType: "tests", // This question tests this misconception
      });
    }

    return NextResponse.json({
      quizzId: newQuiz.id,
      questionCount: generatedQuestions.length,
      targetedMisconceptions: targetMisconceptions.map((m) => ({
        id: m.id,
        concept: m.concept,
        type: m.misconceptionType,
      })),
    });
  } catch (e: any) {
    console.error("Error generating adaptive quiz:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
