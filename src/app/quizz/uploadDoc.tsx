"use client"
import {useState, useEffect} from "react";
import {Button} from "@/components/ui/button"
import {useRouter} from "next/navigation";
import { incrementFreeTrials } from "@/app/actions/checkFreeTrials";
import FolderManager from "@/components/FolderManager";

const UploadDoc = () => {
    const[document, setDocument] = useState<File | null | undefined>(null);
    const[isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [loadingMessage, setLoadingMessage] = useState<string>("");
    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
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
        if (selectedFolderId) {
            formData.append("folderId", selectedFolderId.toString());
        }
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
        <div className = "w-full max-w-2xl mx-auto">

            {isLoading ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
                    <p className="text-lg font-medium animate-pulse">{loadingMessage}</p>
                </div>
            ) : (
                <div className="w-full space-y-6">
                    {/* Step 1: Folder Selection (Required) */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-blue-500 dark:border-blue-600 p-6 shadow-lg">
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                Step 1: Select or Create a Folder
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Organize your quizzes by subject or topic. Create a new folder or select an existing one.
                            </p>
                        </div>
                        <FolderManager
                            onFolderSelect={setSelectedFolderId}
                            selectedFolderId={selectedFolderId}
                            showManagement={true}
                            requireSelection={true}
                        />
                    </div>

                    {/* Step 2: Document Upload (Only shown when folder is selected) */}
                    {selectedFolderId ? (
                        <form className="w-full space-y-6" onSubmit={handleSubmit}>
                            <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-green-500 dark:border-green-600 p-6 shadow-lg">
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                        Step 2: Upload Your Document
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Upload a PDF document to generate quiz questions.
                                    </p>
                                </div>

                                <label
                                    htmlFor="document"
                                    className="bg-secondary w-full flex h-32 rounded-xl border-4 border-dashed border-blue-900 dark:border-blue-500 relative cursor-pointer hover:border-blue-700 dark:hover:border-blue-400 transition-colors"
                                >
                                    <div className="absolute inset-0 m-auto flex flex-col justify-center items-center gap-2">
                                        <svg className="w-12 h-12 text-blue-900 dark:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                            {document?.name ?? "Click or drag a PDF document to upload"}
                                        </span>
                                        {document && (
                                            <span className="text-sm text-green-600 dark:text-green-400">
                                                ✓ Ready to generate quiz
                                            </span>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        id="document"
                                        accept=".pdf"
                                        className="relative block w-full h-full z-50 opacity-0 cursor-pointer"
                                        onChange={(e) => setDocument(e?.target?.files?.[0])}
                                    />
                                </label>

                                {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}

                                <Button
                                    size="lg"
                                    className="mt-6 w-full text-lg"
                                    type="submit"
                                    disabled={!document}
                                >
                                    Generate Quiz
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="bg-gray-100 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12">
                            <div className="text-center">
                                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                    Please Select a Folder First
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Choose or create a folder above to organize your quiz and continue.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default UploadDoc;