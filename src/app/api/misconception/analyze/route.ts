import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { auth } from "@/auth";
import { db } from "@/db";
import { misconceptions, misconceptionPatterns, questionMisconceptions } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

interface AnalyzeMisconceptionRequest {
  questionId: number;
  questionText: string;
  correctAnswer: string;
  userAnswer: string;
  allAnswerOptions: string[];
  confidence: "low" | "medium" | "high";
  isCorrect: boolean;
  folderId?: number;
}

interface MisconceptionAnalysis {
  misconceptionType: string;
  concept: string;
  description: string;
  cognitiveErrorPattern: string;
  relatedConcepts: string[];
  suggestedQuestionTypes: string[];
  shouldTrack: boolean; // Whether this warrants creating a misconception entry
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const body: AnalyzeMisconceptionRequest = await req.json();
    const {
      questionId,
      questionText,
      correctAnswer,
      userAnswer,
      allAnswerOptions,
      confidence,
      isCorrect,
      folderId,
    } = body;

    // Only analyze if: wrong answer OR correct answer with low confidence
    if (isCorrect && confidence !== "low") {
      return NextResponse.json({
        analyzed: false,
        message: "Correct answer with medium/high confidence - no misconception detected",
      });
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
      temperature: 0.3, // Lower temperature for more consistent analysis
    });

    const systemMessage = new SystemMessage({
      content: `You are an expert cognitive learning analyst specializing in misconception detection.

Your task is to analyze a student's answer and identify the underlying misconception - the cognitive error pattern they're exhibiting.

You will receive:
1. The question
2. The correct answer
3. The student's answer
4. All available answer options
5. Student's confidence level
6. Whether the answer was correct

Your analysis should focus on:
- What conceptual misunderstanding led to this answer?
- What cognitive error pattern is present? (e.g., inverse optimization, cause vs effect confusion, keyword matching, etc.)
- What related concepts are involved?
- How can we test/correct this specific misconception?

Return a JSON object with this exact structure:
{
  "misconceptionType": "Clear, concise description of the misconception (max 100 chars)",
  "concept": "Main concept involved (e.g., 'PCA objective function')",
  "description": "Detailed explanation of the misconception (2-3 sentences)",
  "cognitiveErrorPattern": "Pattern type (e.g., 'inverse_optimization', 'cause_vs_effect', 'keyword_matching', 'correlation_vs_causation', 'temporal_confusion', 'part_whole_confusion', 'scope_confusion', 'other')",
  "relatedConcepts": ["array", "of", "related", "concepts"],
  "suggestedQuestionTypes": ["array", "of", "question", "types", "to", "test", "this"],
  "shouldTrack": boolean // true if this is a significant misconception worth tracking, false if it's just a minor error or guess
}

Important:
- Be specific and actionable
- Focus on the WHY, not just the WHAT
- Set shouldTrack to false for random guesses or minor slips
- Set shouldTrack to true for systematic conceptual errors`,
    });

    const userMessage = new HumanMessage({
      content: `Analyze this student response:

Question: ${questionText}

Correct Answer: ${correctAnswer}

Student's Answer: ${userAnswer}

All Answer Options: ${allAnswerOptions.join(", ")}

Student's Confidence: ${confidence}

Answer was: ${isCorrect ? "CORRECT" : "INCORRECT"}

${
  isCorrect && confidence === "low"
    ? "Note: The student got it right but wasn't confident - analyze what uncertainty they might have."
    : ""
}

Provide the misconception analysis in JSON format.`,
    });

    const result = await model.invoke([systemMessage, userMessage]);
    const responseText = result.content.toString();

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response as JSON");
    }

    const analysis: MisconceptionAnalysis = JSON.parse(jsonMatch[0]);

    // If shouldTrack is false, don't create a misconception entry
    if (!analysis.shouldTrack) {
      return NextResponse.json({
        analyzed: true,
        tracked: false,
        message: "Minor error detected but not tracked",
        analysis,
      });
    }

    // Check if this misconception already exists for this user
    const existingMisconception = await db.query.misconceptions.findFirst({
      where: and(
        eq(misconceptions.userId, userId),
        eq(misconceptions.concept, analysis.concept),
        eq(misconceptions.misconceptionType, analysis.misconceptionType),
        eq(misconceptions.status, "active")
      ),
    });

    let misconceptionId: number;

    if (existingMisconception) {
      // Update existing misconception
      const [updated] = await db
        .update(misconceptions)
        .set({
          occurrenceCount: sql`${misconceptions.occurrenceCount} + 1`,
          strength: sql`LEAST(10, ${misconceptions.strength} + 1)`, // Increase strength, max 10
          lastTestedAt: new Date(),
          correctStreakCount: isCorrect ? sql`${misconceptions.correctStreakCount} + 1` : 0,
          status: isCorrect
            ? sql`CASE WHEN ${misconceptions.correctStreakCount} >= 2 THEN 'resolved'::misconception_status ELSE 'resolving'::misconception_status END`
            : "active",
          resolvedAt: isCorrect
            ? sql`CASE WHEN ${misconceptions.correctStreakCount} >= 2 THEN NOW() ELSE NULL END`
            : null,
        })
        .where(eq(misconceptions.id, existingMisconception.id))
        .returning();

      misconceptionId = updated.id;
    } else {
      // Create new misconception
      const [newMisconception] = await db
        .insert(misconceptions)
        .values({
          userId,
          folderId: folderId || null,
          concept: analysis.concept,
          misconceptionType: analysis.misconceptionType,
          description: analysis.description,
          status: isCorrect ? "resolving" : "active",
          strength: 5,
          occurrenceCount: 1,
          correctStreakCount: isCorrect ? 1 : 0,
          lastTestedAt: new Date(),
          resolvedAt: isCorrect && confidence === "low" ? null : null,
        })
        .returning();

      misconceptionId = newMisconception.id;
    }

    // Link question to misconception
    await db
      .insert(questionMisconceptions)
      .values({
        questionId,
        misconceptionId,
        relationshipType: isCorrect ? "tests" : "reveals",
      })
      .onConflictDoNothing();

    // Track cognitive error pattern
    const patternTypeMap: Record<string, any> = {
      "cause_vs_effect": "cause_vs_effect",
      "variance_vs_bias": "variance_vs_bias",
      "correlation_vs_causation": "correlation_vs_causation",
      "inverse_optimization": "inverse_optimization",
      "keyword_matching": "keyword_matching",
      "temporal_confusion": "temporal_confusion",
      "part_whole_confusion": "part_whole_confusion",
      "scope_confusion": "scope_confusion",
      "other": "other",
    };

    const patternType = patternTypeMap[analysis.cognitiveErrorPattern] || "other";

    const existingPattern = await db.query.misconceptionPatterns.findFirst({
      where: and(
        eq(misconceptionPatterns.userId, userId),
        eq(misconceptionPatterns.patternType, patternType)
      ),
    });

    if (existingPattern) {
      await db
        .update(misconceptionPatterns)
        .set({
          occurrenceCount: sql`${misconceptionPatterns.occurrenceCount} + 1`,
          lastDetected: new Date(),
        })
        .where(eq(misconceptionPatterns.id, existingPattern.id));
    } else {
      await db.insert(misconceptionPatterns).values({
        userId,
        patternType,
        description: `Student exhibits pattern: ${analysis.cognitiveErrorPattern}`,
        occurrenceCount: 1,
      });
    }

    return NextResponse.json({
      analyzed: true,
      tracked: true,
      misconceptionId,
      analysis,
    });
  } catch (e: any) {
    console.error("Error in misconception analysis:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
