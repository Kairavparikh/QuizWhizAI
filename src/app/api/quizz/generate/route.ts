import {NextRequest, NextResponse} from "next/server";

import {ChatOpenAI} from "@langchain/openai"
import {HumanMessage} from "@langchain/core/messages";

import {PDFLoader} from "langchain/document_loaders/fs/pdf"
import{JsonOutputFunctionsParser} from "langchain/output_parsers"

import saveQuizz from "./saveToDb";
import {auth} from "@/auth";

export async function POST(req: NextRequest){
    const session = await auth();
    const userId = session?.user?.id;
    
    if (!userId) {
        return NextResponse.json({ error: "User not authenticated"}, {status: 401});
    }

    const body = await req.formData();
    const document = body.get("pdf");
    const folderIdStr = body.get("folderId");
    const folderId = folderIdStr ? parseInt(folderIdStr as string) : null;
    try{
        const pdfLoader = new PDFLoader(document as Blob, {
            parsedItemSeparator: " "
        });
        const docs = await pdfLoader.load();

        const selectedDocuments = docs.filter((doc) => doc.pageContent !== undefined);
        const texts = selectedDocuments.map((doc) => doc.pageContent);

        const prompt = `Analyze the provided document text carefully. Your task is to create a quiz following these rules:

STEP 1 - CHECK FOR EXISTING QUIZ QUESTIONS:
- First, check if the document already contains quiz questions with multiple choice answers
- Look for patterns like: numbered questions, lettered answer choices (A, B, C, D), questions followed by options
- If quiz questions are found, extract them EXACTLY word-for-word, preserving all questions regardless of quantity

STEP 2 - EXTRACTION (if quiz found) OR GENERATION (if no quiz found):
- If quiz questions exist: Extract ALL questions word-for-word. Do NOT limit the number of questions. Include every single question found.
- If no quiz questions exist: Generate at least 8 high-quality questions based on the content

FORMATTING REQUIREMENTS:
- Return JSON only with fields: name, description, and questions
- name: Create an appropriate title for the quiz
- description: Brief description of quiz topic
- questions: Array of question objects with fields: questionText, answers
- Each answer object has: answerText, isCorrect
- Exactly four answer options per question
- Only one answer per question has isCorrect: true
- CRITICAL: Randomize correct answer positions (1st, 2nd, 3rd, or 4th) - do NOT always place correct answer first

Remember: If the document contains quiz questions, extract ALL of them word-for-word without any limit on quantity.`

        if(!process.env.OPENAI_API_KEY){
            return NextResponse.json({ error: "OpenAPIKey not provided"}, {status: 500});
        }

        const model = new ChatOpenAI({
            openAIApiKey: process.env.OPENAI_API_KEY,
            modelName: "gpt-4o"
        });



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

        }

        const runnable = model
        .bind({
            functions:[extractionFunctionSchema],
            function_call:{name: "extractor"},

        })
        .pipe(parser);


        const message = new HumanMessage({
            content: [
                {
                    type: "text",
                    text: prompt + "\n" + texts.join("\n")
                }
            ]
        })
        const result: any = await runnable.invoke([message]);
        console.log("Result:", result);

        // Save the document content along with the quiz
        const documentContent = texts.join("\n");
        const { quizzId } = await saveQuizz(result, userId, documentContent, folderId);


        return NextResponse.json({quizzId}, {status: 200});
    }
    catch(e: any){
        return NextResponse.json({ error: e.message}, {status: 500});
    }
}