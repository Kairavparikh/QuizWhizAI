"use client"
import {useState, useEffect} from "react";
import {Button} from "@/components/ui/button"
import {useRouter} from "next/navigation";
import { incrementFreeTrials } from "@/app/actions/checkFreeTrials";

const UploadDoc = () => {
    const[document, setDocument] = useState<File | null | undefined>(null);
    const[isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [loadingMessage, setLoadingMessage] = useState<string>("");
    const router = useRouter();

    const loadingMessages = [
        "Uploading your document...",
        "Reading PDF content...",
        "Analyzing key concepts...",
        "Identifying important topics...",
        "Generating quiz questions...",
        "Creating answer options...",
        "Randomizing answers...",
        "Finalizing your quiz...",
        "Almost there..."
    ];

    useEffect(() => {
        if (!isLoading) return;

        let messageIndex = 0;
        setLoadingMessage(loadingMessages[0]);

        const interval = setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setLoadingMessage(loadingMessages[messageIndex]);
        }, 2000); // Change message every 2 seconds

        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) =>{
        e.preventDefault();
        if(!document){
            setError("Please upload a document");
            return;
        }
        setIsLoading(true);
        setError(""); // Clear previous errors
        const formData = new FormData();
        formData.append("pdf", document as Blob);
        try{
            const res = await fetch("/api/quizz/generate",{
                method: "POST",
                body: formData
            })
         if(res.status === 200){
            const data = await res.json();
            const quizzId = data.quizzId;

            await incrementFreeTrials();

            router.push(`/quizz/${quizzId}`);
         } else {
            // Handle non-200 responses
            const errorData = await res.json().catch(() => ({ error: "Unknown error occurred" }));
            console.error("API Error:", errorData);
            setError(errorData.error || `Failed to generate quiz (Status: ${res.status})`);
         }
        }
         catch(e: any){
            console.log("error while generating", e)
            setError(e.message || "An unexpected error occurred. Please try again.");
         }
         setIsLoading(false);
        }
    return(
        <div className = "w-full">

            {isLoading ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
                    <p className="text-lg font-medium animate-pulse">{loadingMessage}</p>
                </div>
            ) : <form className = "w-full" onSubmit = {handleSubmit}>
                <label htmlFor="document" className = "bg-secondary w-full flex h-20 rounded-md border-4 border-dashed border-blue-900 relative">
                <div className = "absolute inset-0 m-auto flex justify-center items-center">
                    {document?.name ?? "Drag a document to start"}
                </div>
                    <input type="file" id="document" className = "relative block w-full h-full z-50 opacity-0"onChange = {(e) => setDocument(e?.target?.files?.[0])}/>
                </label>
                {error}
                {error ? <p className = "text-red-500">{error}</p>: null}
                <Button size="lg" className = "mt-2"
                type = "submit">Generate Quiz</Button>
            </form>}
        </div>
    )
}

export default UploadDoc;