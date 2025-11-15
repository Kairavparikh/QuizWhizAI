import Image from "next/image"
import { auth } from "@/auth";
import GetStartedButton from "@/components/GetStartedButton";

export default async function Home() {
  const session = await auth();
  const isAuthenticated = !!session?.user;

  return (
    <div className = "flex flex-col flex-1">
    <main className="flex justify-center flex-1">
      <div className="items-center flex flex-col sm:flex-row gap-20 justify-end mx-auto p-10 w-full sm:py-20 sm:w-[1000px]">
        <div>
          <Image src="/images/owl-landing-no-bg.png" alt="QuizWhizAI Owl" width={400} height={400} />
        </div>
        <div className="text-center flex gap-6 flex-col">
            <h1 className = "text-3xl font-bold">Get quizzed about anything!</h1>
            <h3 className="text-sm">Upload Documents, and easily generate your personalized quizzes with AI.</h3>
            <GetStartedButton isAuthenticated={isAuthenticated} />
      </div>
      </div>
    </main>

    </div>
  )
}
