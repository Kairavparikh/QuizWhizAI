"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare } from "lucide-react";

type Question = {
  id: number;
  questionText: string | null;
  answers: any[];
};

interface ReviewChatbotProps {
  questions: Question[];
  wrongAnswers: Array<{
    questionText: string;
    userAnswer: string;
    correctAnswer: string;
    confidence: string;
    concept: string;
  }>;
  selectedQuestionIndex?: number | null;
  onQuestionSelect?: (index: number | null) => void;
  documentContent?: string | null;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ReviewChatbot({ questions, wrongAnswers, selectedQuestionIndex = null, onQuestionSelect, documentContent = "" }: ReviewChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Build context for the AI
      const contextInfo = selectedQuestionIndex !== null
        ? wrongAnswers[selectedQuestionIndex]
        : { questionText: "General quiz review", userAnswer: "", correctAnswer: "", concept: "quiz topics" };

      const response = await fetch("/api/quizz/chat-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: contextInfo,
          documentContent: documentContent,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = { role: "assistant", content: data.message };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden h-[calc(100vh-200px)] min-h-[600px] flex flex-col">
      {/* Header with Context Info */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-white font-bold text-2xl flex items-center gap-3 mb-2">
              <MessageSquare className="w-7 h-7" />
              AI Study Assistant
            </h3>
            <p className="text-white/90 text-sm">
              {selectedQuestionIndex !== null
                ? `Discussing Question ${selectedQuestionIndex + 1}`
                : "General quiz discussion - Select a question from the right panel for specific help"}
            </p>
          </div>
          {selectedQuestionIndex !== null && onQuestionSelect && (
            <button
              onClick={() => onQuestionSelect(null)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-all"
            >
              Clear Selection
            </button>
          )}
        </div>
      </div>

      {/* Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900/50">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400 max-w-md">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h4 className="text-xl font-semibold mb-2">Ready to Help!</h4>
              <p className="text-sm mb-4">I&apos;m here to answer your questions about the quiz.</p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-left space-y-2">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Try asking:</p>
                <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• &quot;Explain why my answer was wrong&quot;</li>
                  <li>• &quot;What&apos;s the key concept I&apos;m missing?&quot;</li>
                  <li>• &quot;Can you give me a similar example?&quot;</li>
                  <li>• &quot;Help me understand this topic better&quot;</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl p-4 shadow-sm ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></div>
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input - Fixed at Bottom */}
      <div className="p-6 border-t-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={selectedQuestionIndex !== null ? `Ask about Question ${selectedQuestionIndex + 1}...` : "Ask me anything about the quiz..."}
            className="flex-1 px-5 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="lg"
            className="px-6"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Press Enter to send • Select a question on the right for context-specific help
        </p>
      </div>
    </div>
  );
}
