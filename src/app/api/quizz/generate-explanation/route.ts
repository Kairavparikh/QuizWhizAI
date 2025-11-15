import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { auth } from "@/auth";
import {
  generateExplanationPrompt,
  generateFollowUpPrompt,
  type LearningState,
} from "@/lib/confidenceMapping";

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      learningState,
      questionText,
      correctAnswer,
      userAnswer,
      concept,
    }: {
      learningState: LearningState;
      questionText: string;
      correctAnswer: string;
      userAnswer: string;
      concept: string;
    } = body;

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

    // Generate explanation
    const explanationPrompt = generateExplanationPrompt(
      learningState,
      questionText,
      correctAnswer,
      userAnswer
    );

    const explanationMessage = new HumanMessage({
      content: explanationPrompt,
    });

    const explanationResult = await model.invoke([explanationMessage]);
    const explanation = explanationResult.content.toString();

    // Generate follow-up question (only for wrong answers)
    let followUpQuestion = null;
    if (learningState === "HIGH_CONFIDENCE_WRONG" || learningState === "LOW_CONFIDENCE_WRONG") {
      const followUpPrompt = generateFollowUpPrompt(
        learningState,
        questionText,
        concept
      );

      const followUpMessage = new HumanMessage({
        content: followUpPrompt,
      });

      const followUpResult = await model.invoke([followUpMessage]);
      followUpQuestion = followUpResult.content.toString();
    }

    return NextResponse.json(
      {
        explanation,
        followUpQuestion,
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("Error generating explanation:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
