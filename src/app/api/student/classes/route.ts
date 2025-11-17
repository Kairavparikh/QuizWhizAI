import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { classMembers, quizAssignments, quizzSubmissions } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET - Fetch all classes a student is enrolled in with assignments
export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    // Get all class memberships for this student
    const studentClasses = await db.query.classMembers.findMany({
      where: eq(classMembers.studentId, userId),
      with: {
        class: {
          with: {
            teacher: {
              columns: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            assignments: {
              with: {
                quiz: {
                  with: {
                    questions: true,
                  },
                },
              },
              orderBy: (assignments, { desc }) => [desc(assignments.createdAt)],
            },
          },
        },
      },
      orderBy: (members, { desc }) => [desc(members.joinedAt)],
    });

    // For each assignment, check if the student has completed it
    const classesWithProgress = await Promise.all(
      studentClasses.map(async (membership) => {
        const classWithProgress = {
          ...membership.class,
          assignments: await Promise.all(
            membership.class.assignments.map(async (assignment) => {
              // Check if student has submitted this quiz
              const submission = await db.query.quizzSubmissions.findFirst({
                where: eq(quizzSubmissions.quizzId, assignment.quizId),
                columns: {
                  id: true,
                  score: true,
                  createdAt: true,
                },
              });

              return {
                ...assignment,
                completed: !!submission,
                submission: submission || null,
              };
            })
          ),
        };

        return {
          ...membership,
          class: classWithProgress,
        };
      })
    );

    return NextResponse.json({ classes: classesWithProgress });
  } catch (e: any) {
    console.error("Error fetching student classes:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
