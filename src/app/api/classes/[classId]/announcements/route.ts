import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { classes, classMembers, notifications, users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { sendNotificationEmail } from "@/lib/email";

export async function GET(
  req: NextRequest,
  { params }: { params: { classId: string } }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const classId = parseInt(params.classId);

    // Verify teacher owns this class
    const classData = await db.query.classes.findFirst({
      where: eq(classes.id, classId),
    });

    if (!classData || classData.teacherId !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get all announcement notifications for this class
    const announcements = await db.query.notifications.findMany({
      where: and(
        eq(notifications.classId, classId),
        eq(notifications.type, "ANNOUNCEMENT")
      ),
      orderBy: [desc(notifications.createdAt)],
    });

    // For each announcement, get the list of students who read it
    const announcementsWithReads = await Promise.all(
      announcements.map(async (announcement) => {
        // Get all notifications with same title/message (sent to all students)
        const relatedNotifications = await db.query.notifications.findMany({
          where: and(
            eq(notifications.classId, classId),
            eq(notifications.type, "ANNOUNCEMENT"),
            eq(notifications.title, announcement.title),
            eq(notifications.createdAt, announcement.createdAt)
          ),
          with: {
            user: true,
          },
        });

        const readBy = relatedNotifications
          .filter(n => n.read)
          .map(n => ({
            userId: n.userId,
            userName: n.user?.name || 'Unknown',
            userEmail: n.user?.email || '',
            readAt: n.createdAt,
          }));

        const totalRecipients = relatedNotifications.length;
        const readCount = readBy.length;

        return {
          id: announcement.id,
          title: announcement.title,
          message: announcement.message,
          createdAt: announcement.createdAt,
          totalRecipients,
          readCount,
          readBy,
        };
      })
    );

    // Deduplicate announcements (group by title + createdAt)
    const uniqueAnnouncements = announcementsWithReads.reduce((acc, curr) => {
      const key = `${curr.title}-${curr.createdAt.toISOString()}`;
      if (!acc.has(key)) {
        acc.set(key, curr);
      }
      return acc;
    }, new Map());

    return NextResponse.json({
      announcements: Array.from(uniqueAnnouncements.values()),
    });
  } catch (error: any) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { classId: string } }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const classId = parseInt(params.classId);
    const body = await req.json();
    const { title, message, sendEmail } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and message are required" },
        { status: 400 }
      );
    }

    // Verify teacher owns this class
    const classData = await db.query.classes.findFirst({
      where: eq(classes.id, classId),
    });

    if (!classData || classData.teacherId !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get teacher info for email
    const teacher = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    // Get all students in the class
    const members = await db.query.classMembers.findMany({
      where: eq(classMembers.classId, classId),
      with: {
        student: true,
      },
    });

    if (members.length === 0) {
      return NextResponse.json(
        { error: "No students in this class" },
        { status: 400 }
      );
    }

    // Create notifications for all students
    const notificationPromises = members.map((member) =>
      db.insert(notifications).values({
        userId: member.studentId,
        type: "ANNOUNCEMENT",
        title: title,
        message: message,
        classId: classId,
        createdById: userId,
        link: `/student/classes`,
        read: false,
      })
    );

    await Promise.all(notificationPromises);

    // Send emails if requested
    if (sendEmail) {
      const emailPromises = members.map((member) => {
        if (member.student.email) {
          return sendNotificationEmail({
            to: member.student.email,
            type: "ANNOUNCEMENT",
            data: {
              userName: member.student.name || 'Student',
              title: title,
              message: message,
              link: `/student/classes`,
              className: classData.name,
              teacherName: teacher?.name || 'Your teacher',
            },
          });
        }
        return Promise.resolve();
      });

      try {
        await Promise.allSettled(emailPromises);
        console.log(`Emails sent to ${members.length} students`);
      } catch (emailError) {
        console.error("Error sending emails:", emailError);
        // Don't fail the request if emails fail
      }
    }

    return NextResponse.json({
      success: true,
      message: `Announcement sent to ${members.length} students`,
      studentCount: members.length,
    });
  } catch (error: any) {
    console.error("Error creating announcement:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
