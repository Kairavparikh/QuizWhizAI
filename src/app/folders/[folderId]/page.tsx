import { db } from "@/db";
import { folders, quizzes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import FolderContents from "./FolderContents";

export default async function FolderPage({
  params,
}: {
  params: { folderId: string };
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/api/auth/signin");
  }

  const folderId = parseInt(params.folderId);

  // Fetch folder info
  const folder = await db.query.folders.findFirst({
    where: and(eq(folders.id, folderId), eq(folders.userId, userId)),
  });

  if (!folder) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Folder Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            This folder does not exist or you don&apos;t have access to it.
          </p>
        </div>
      </div>
    );
  }

  // Fetch quizzes in this folder
  const folderQuizzes = await db.query.quizzes.findMany({
    where: and(eq(quizzes.folderId, folderId), eq(quizzes.userId, userId)),
    with: {
      questions: true,
    },
  });

  // Transform data for client component
  const quizzesWithContent = folderQuizzes.map((quiz) => ({
    id: quiz.id,
    name: quiz.name,
    description: quiz.description,
    documentContent: quiz.documentContent,
    questionCount: quiz.questions.length,
    createdAt: quiz.createdAt.toISOString(),
  }));

  return (
    <FolderContents
      folder={{
        id: folder.id,
        name: folder.name,
        description: folder.description,
      }}
      quizzes={quizzesWithContent}
    />
  );
}
