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

        const prompt = "given the text which is a summary of the document, generate a quiz based on the text with at least 8 questions. Return json only that contains a quiz object with fields: name, description and questions. CRITICAL: Randomize the position of the correct answer - do NOT always place it first. Mix up the positions so correct answers appear as the 1st, 2nd, 3rd, or 4th option across different questions. There must be exactly four answer options for each question. questions is an array of objects with fields: questionText, answers. The answers array contains objects with fields: answerText, isCorrect. Only one answer per question should have isCorrect: true."

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