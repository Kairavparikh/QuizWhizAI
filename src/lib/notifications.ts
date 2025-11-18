import { db } from "@/db";
import { notifications, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendNotificationEmail } from "./email";

export interface CreateNotificationParams {
  userId: string;
  type: "ASSIGNMENT_POSTED" | "ANNOUNCEMENT" | "QUIZ_GRADED" | "STUDENT_JOINED_CLASS" | "QUIZ_REMINDER" | "CLASS_UPDATE";
  title: string;
  message: string;
  classId?: number | null;
  assignmentId?: number | null;
  quizId?: number | null;
  dueDate?: Date | null;
  link?: string | null;
  createdById?: string | null;
  sendEmail?: boolean;
  emailData?: {
    className?: string;
    teacherName?: string;
    score?: number;
  };
}

/**
 * Creates a notification in the database and optionally sends an email
 */
export async function createNotification(params: CreateNotificationParams) {
  const {
    userId,
    type,
    title,
    message,
    classId,
    assignmentId,
    quizId,
    dueDate,
    link,
    createdById,
    sendEmail = false,
    emailData = {},
  } = params;

  try {
    // Create notification in database
    const [notification] = await db
      .insert(notifications)
      .values({
        userId,
        type,
        title,
        message,
        classId: classId || null,
        assignmentId: assignmentId || null,
        quizId: quizId || null,
        dueDate: dueDate || null,
        link: link || null,
        createdById: createdById || null,
        read: false,
      })
      .returning();

    // Send email if requested
    if (sendEmail) {
      try {
        const user = await db.query.users.findFirst({
          where: eq(users.id, userId),
        });

        if (user && user.email) {
          await sendNotificationEmail({
            to: user.email,
            type: type as any,
            data: {
              userName: user.name || 'there',
              title,
              message,
              link: link || '#',
              className: emailData.className,
              dueDate: dueDate?.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
              score: emailData.score,
              teacherName: emailData.teacherName,
            },
          });
        }
      } catch (emailError) {
        console.error('Error sending notification email:', emailError);
        // Don't throw - notification was created successfully even if email failed
      }
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Creates notifications for multiple users (e.g., all students in a class)
 */
export async function createBulkNotifications(
  recipients: string[],
  params: Omit<CreateNotificationParams, 'userId'>
) {
  const results = await Promise.allSettled(
    recipients.map((userId) =>
      createNotification({
        ...params,
        userId,
      })
    )
  );

  const successful = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  return { successful, failed, total: recipients.length };
}
