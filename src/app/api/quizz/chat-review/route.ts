import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { messages, context, documentContent } = body;

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

    // Build the system message with context including document content
    const systemMessage = new SystemMessage({
      content: `You are a helpful quiz review assistant. You're helping a student review their quiz performance.

${documentContent ? `DOCUMENT CONTENT:
${documentContent}

The quiz was based on the above document. You can reference any part of this content to help explain concepts.

` : ""}${context.questionText !== "General quiz review"
  ? `Current Question Context:
Question: ${context.questionText}
Student's Answer: ${context.userAnswer}
Correct Answer: ${context.correctAnswer}
Concept: ${context.concept}

Help the student understand this question, provide explanations, hints, and answer their questions about this topic. You can reference the document content above to provide deeper explanations.`
  : "The student is asking general questions about the quiz. Help them understand concepts, provide explanations, and answer their questions. You can reference any part of the document content to help explain topics."
}

Be encouraging, clear, and educational. If they ask about a specific question, refer to the context provided. Keep responses concise but informative (2-4 sentences unless they ask for more detail).`,
    });

    // Convert messages to LangChain format
    const chatMessages = [systemMessage];
    for (const msg of messages) {
      if (msg.role === "user") {
        chatMessages.push(new HumanMessage({ content: msg.content }));
      } else if (msg.role === "assistant") {
        chatMessages.push(new AIMessage({ content: msg.content }));
      }
    }

    const result = await model.invoke(chatMessages);
    const responseText = result.content.toString();

    return NextResponse.json({ message: responseText }, { status: 200 });
  } catch (e: any) {
    console.error("Error in chat review:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
