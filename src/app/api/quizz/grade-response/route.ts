import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { question, userResponse, correctAnswer, concept } = body;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-4o",
      temperature: 0.3, // Lower temperature for more consistent grading
    });

    const prompt = `You are grading a student's response to a follow-up question.

Question: ${question}
Correct Answer: ${correctAnswer}
Student's Response: ${userResponse}
Concept: ${concept}

Determine if the student's response is correct. Be flexible - accept answers that demonstrate understanding even if worded differently. Look for the key concepts rather than exact wording.

Respond with a JSON object containing:
1. "isCorrect": boolean - true if the student demonstrates understanding, false otherwise
2. "explanation": string - A brief (1-2 sentences) explanation. If correct, praise them and reinforce the concept. If incorrect, gently explain why and provide the correct understanding.

Return ONLY valid JSON, no other text.`;

    const message = new HumanMessage({
      content: prompt,
    });

    const result = await model.invoke([message]);
    const resultText = result.content.toString();

    // Parse the JSON response
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from AI");
    }

    const grading = JSON.parse(jsonMatch[0]);

    return NextResponse.json(
      {
        isCorrect: grading.isCorrect,
        explanation: grading.explanation,
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("Error grading response:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
