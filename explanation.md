# QuizWhizAI Codebase Explanation

## 1. Project Overview
QuizWhizAI is an AI-powered platform designed to transform documents into interactive learning experiences. It leverages OpenAI's GPT-4 to generate quizzes from uploaded documents and provides advanced learning analytics to help users master the material. The platform features a "Confidence Mapping" system that categorizes learning states based on user performance and confidence, enabling a spaced repetition system for optimal study scheduling.

## 2. Key Features

### 🤖 AI-Powered Quiz Generation
- **Document Processing**: Users can upload documents (PDF, DOC, etc.), which are parsed and processed.
- **Question Generation**: The system uses GPT-4 (via LangChain) to analyze the content and generate relevant quiz questions.
- **Contextual Understanding**: Questions are generated with context from the source material.

### 🧠 Advanced Learning Analytics
- **Confidence Mapping**: Users indicate their confidence level for each answer.
- **Learning States**: The system classifies answers into four states:
    - **High Confidence Wrong (Misconceptions)**: Critical to address.
    - **Low Confidence Wrong (Known Weaknesses)**: Needs review.
    - **Low Confidence Correct (Underconfident Mastery)**: Needs reinforcement.
    - **High Confidence Correct (True Mastery)**: Mastered content.
- **Spaced Repetition**: Review intervals are dynamically scheduled based on the priority of the learning state.

### 🎯 Adaptive Study Assistant
- **Smart Review**: An AI chatbot interface for personalized study assistance.
- **Feedback**: Detailed explanations and color-coded feedback based on learning states.
- **Adaptive Quizzing**: Targeted practice quizzes focusing on weak areas.

### 💳 Subscription & User Management
- **Freemium Model**: Free trial with limited features, premium subscription for full access.
- **Stripe Integration**: Handles payments and subscriptions.
- **Authentication**: Secure login via Google OAuth (NextAuth.js).

## 3. Technology Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [Shadcn/ui](https://ui.shadcn.com/) components.
- **State Management**: React Hooks and Server Actions.
- **Visualizations**: D3.js / Recharts for analytics dashboards.

### Backend
- **API**: Next.js API Routes & Server Actions.
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) for type-safe database interactions.
- **AI/LLM**: [OpenAI API](https://openai.com/) (GPT-4) integrated via [LangChain](https://js.langchain.com/).
- **File Parsing**: `pdf-parse` for extracting text from PDFs.

### Infrastructure & Services
- **Hosting**: Vercel.
- **Auth**: NextAuth.js (v5).
- **Payments**: Stripe.

## 4. Project Structure

The codebase follows a standard Next.js App Router structure:

```
src/
├── app/                    # App Router pages and layouts
│   ├── (user)/             # Protected routes (dashboard, billing)
│   ├── api/                # API endpoints (quiz generation, stripe webhooks)
│   ├── quizz/              # Quiz-specific pages and logic
│   └── page.tsx            # Landing page
├── components/             # Reusable UI components (buttons, dialogs, forms)
│   ├── ui/                 # Shadcn/ui primitives
│   └── ...                 # Feature-specific components
├── db/                     # Database configuration and schema
│   ├── schema.ts           # Drizzle schema definitions
│   └── index.ts            # Database connection
├── lib/                    # Utility functions and shared logic
│   ├── gpt.ts              # OpenAI/LangChain integration
│   ├── stripe.ts           # Stripe client setup
│   └── utils.ts            # Helper functions
├── actions/                # Server Actions for mutations (form submissions, etc.)
└── auth.ts                 # NextAuth configuration
```

## 5. Database Schema

The data model is defined in `src/db/schema.ts` using Drizzle ORM. Key tables likely include:

- **users**: Stores user info, auth details, and subscription status.
- **quizzes**: Metadata for generated quizzes.
- **questions**: The actual questions belonging to a quiz.
- **answers**: User submissions for questions, including correctness and confidence.
- **learning_analytics**: Aggregated data for tracking progress and spaced repetition schedules.

## 6. Key Workflows

### Quiz Generation Flow
1.  User uploads a file via the UI.
2.  File is uploaded to the server/cloud.
3.  Text is extracted from the file.
4.  Text is sent to OpenAI (via LangChain) with a prompt to generate questions.
5.  Generated questions are parsed and saved to the `questions` table in the database.
6.  User is redirected to the quiz page.

### Confidence & Spaced Repetition
1.  User answers a question and selects a confidence level.
2.  System evaluates correctness and combines it with confidence to determine the **Learning State**.
3.  The result is saved to the database.
4.  The **Spaced Repetition Algorithm** calculates the next review time for that topic/question based on the Learning State priority.

## 7. Getting Started

1.  **Clone the repo**: `git clone ...`
2.  **Install dependencies**: `npm install`
3.  **Environment Setup**: Copy `.env.example` to `.env` and fill in API keys (OpenAI, Stripe, Database URL, NextAuth).
4.  **Database Migration**: Run `npm run db:push` to sync the schema.
5.  **Run Dev Server**: `npm run dev`

---
*Generated by Antigravity*
