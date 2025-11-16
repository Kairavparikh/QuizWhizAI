import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const audioFile = formData.get("audio") as File;

        if (!audioFile) {
            return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
        }

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // Convert File to Buffer for OpenAI API
        const arrayBuffer = await audioFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Create a File-like object that OpenAI accepts
        const file = new File([buffer], audioFile.name, { type: audioFile.type });

        // Use Whisper API for transcription
        const transcription = await openai.audio.transcriptions.create({
            file: file,
            model: "whisper-1",
            language: "en", // Can be made dynamic based on user preference
            response_format: "text",
        });

        return NextResponse.json({
            text: transcription,
            success: true,
        });
    } catch (error: any) {
        console.error("Transcription error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to transcribe audio" },
            { status: 500 }
        );
    }
}
