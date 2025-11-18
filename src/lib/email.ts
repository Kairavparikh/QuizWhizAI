import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || 'QuizWhiz <noreply@quizwhiz.app>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface EmailNotification {
  to: string;
  type: 'ASSIGNMENT_POSTED' | 'ANNOUNCEMENT' | 'QUIZ_GRADED' | 'STUDENT_JOINED_CLASS';
  data: {
    userName: string;
    title: string;
    message: string;
    link: string;
    className?: string;
    dueDate?: string;
    score?: number;
    teacherName?: string;
  };
}

export async function sendNotificationEmail(notification: EmailNotification) {
  try {
    const { to, type, data } = notification;

    console.log(`📧 Attempting to send email to: ${to}, type: ${type}`);

    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is not set in environment variables');
      throw new Error('RESEND_API_KEY is not configured');
    }

    let subject = '';
    let html = '';

    switch (type) {
      case 'ASSIGNMENT_POSTED':
        subject = `New Assignment: ${data.title}`;
        html = getAssignmentEmailTemplate(data);
        break;

      case 'ANNOUNCEMENT':
        subject = `📢 ${data.className}: ${data.title}`;
        html = getAnnouncementEmailTemplate(data);
        break;

      case 'QUIZ_GRADED':
        subject = `Quiz Graded: ${data.title}`;
        html = getQuizGradedEmailTemplate(data);
        break;

      case 'STUDENT_JOINED_CLASS':
        subject = `New Student in ${data.className}`;
        html = getStudentJoinedEmailTemplate(data);
        break;

      default:
        console.error(`❌ Unknown notification type: ${type}`);
        return;
    }

    console.log(`📤 Sending email with subject: "${subject}"`);

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent successfully! Result:`, result);
    return result;
  } catch (error: any) {
    console.error('❌ Error sending email:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    throw error;
  }
}

// Email Templates

function getAssignmentEmailTemplate(data: EmailNotification['data']) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        .info-box { background: white; border-left: 4px solid #667eea; padding: 15px; margin: 15px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">📚 New Assignment Posted</h1>
        </div>
        <div class="content">
          <p>Hi ${data.userName},</p>
          <p>${data.teacherName || 'Your teacher'} has posted a new assignment in <strong>${data.className}</strong>!</p>

          <div class="info-box">
            <h2 style="margin-top: 0;">${data.title}</h2>
            <p>${data.message}</p>
            ${data.dueDate ? `<p><strong>📅 Due:</strong> ${data.dueDate}</p>` : ''}
          </div>

          <center>
            <a href="${APP_URL}${data.link}" class="button">View Assignment</a>
          </center>

          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Click the button above or check your inbox at QuizWhiz to view the full details and start the assignment.
          </p>
        </div>
        <div class="footer">
          <p>QuizWhiz AI - Personalized Learning Through Adaptive Quizzes</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getAnnouncementEmailTemplate(data: EmailNotification['data']) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        .announcement-box { background: white; border: 2px solid #f59e0b; padding: 20px; margin: 15px 0; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">📢 Class Announcement</h1>
        </div>
        <div class="content">
          <p>Hi ${data.userName},</p>
          <p>${data.teacherName || 'Your teacher'} posted an announcement in <strong>${data.className}</strong>:</p>

          <div class="announcement-box">
            <h2 style="margin-top: 0; color: #f59e0b;">${data.title}</h2>
            <p style="white-space: pre-wrap;">${data.message}</p>
          </div>

          <center>
            <a href="${APP_URL}${data.link}" class="button">View in QuizWhiz</a>
          </center>
        </div>
        <div class="footer">
          <p>QuizWhiz AI - Personalized Learning Through Adaptive Quizzes</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getQuizGradedEmailTemplate(data: EmailNotification['data']) {
  const score = data.score || 0;
  const emoji = score >= 90 ? '🎉' : score >= 70 ? '👍' : '📝';
  const message = score >= 90
    ? 'Excellent work!'
    : score >= 70
    ? 'Good job!'
    : 'Keep practicing!';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        .score-box { background: white; padding: 30px; margin: 15px 0; border-radius: 8px; text-align: center; }
        .score { font-size: 48px; font-weight: bold; color: #10b981; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">✅ Quiz Graded</h1>
        </div>
        <div class="content">
          <p>Hi ${data.userName},</p>
          <p>Your quiz has been graded!</p>

          <div class="score-box">
            <h2 style="margin-top: 0;">${data.title}</h2>
            <div class="score">${score}% ${emoji}</div>
            <p style="font-size: 18px; color: #6b7280; margin: 10px 0;">${message}</p>
          </div>

          <center>
            <a href="${APP_URL}${data.link}" class="button">View Detailed Results</a>
          </center>

          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Check your detailed results to see which concepts you've mastered and where you can improve.
          </p>
        </div>
        <div class="footer">
          <p>QuizWhiz AI - Personalized Learning Through Adaptive Quizzes</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getStudentJoinedEmailTemplate(data: EmailNotification['data']) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        .student-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #3b82f6; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">👋 New Student</h1>
        </div>
        <div class="content">
          <p>Hi ${data.userName},</p>
          <p>Great news! A new student has joined your class.</p>

          <div class="student-box">
            <p style="font-size: 18px; margin: 0;"><strong>${data.title}</strong></p>
            <p style="color: #6b7280; margin: 5px 0 0 0;">Class: ${data.className}</p>
          </div>

          <center>
            <a href="${APP_URL}${data.link}" class="button">View Class Roster</a>
          </center>
        </div>
        <div class="footer">
          <p>QuizWhiz AI - Personalized Learning Through Adaptive Quizzes</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
