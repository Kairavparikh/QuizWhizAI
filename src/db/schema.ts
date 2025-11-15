import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  serial,
  boolean,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "@auth/core/adapters";
import { relations } from "drizzle-orm";

// Enums for confidence mapping
export const confidenceLevel = pgEnum("confidence_level", ["low", "medium", "high"]);
export const learningState = pgEnum("learning_state", [
  "HIGH_CONFIDENCE_WRONG",
  "LOW_CONFIDENCE_WRONG",
  "LOW_CONFIDENCE_CORRECT",
  "HIGH_CONFIDENCE_CORRECT"
]);

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  stripeCustomerId: text("stripe_customer_id"),
  subscribed: boolean("subscribed"),
  freeTrialsUsed: integer("free_trials_used").default(0),
})

export const userRelations = relations(users, ({many}) => ({
  quizzes: many(quizzes)
}))
 
export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    primaryKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)

 
export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})
 
export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    primaryKey: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
)


export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  name: text("name"),
  description: text("description"),
  userId: text("user_id").references(() => users.id),
  documentContent: text("document_content"),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  questionText: text("question_text"), 
  quizzId: integer("quizz_id").references(() => quizzes.id),
});

export const questionsAnswers = pgTable("answers", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").references(() => questions.id),
  answerText: text("answer_text"),
  isCorrect: boolean("is_correct"),
});

export const quizzesRelations = relations(quizzes, ({ many }) => ({
  questions: many(questions),
  submission: many(quizzSubmissions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  quizz: one(quizzes, {
    fields: [questions.quizzId],
    references: [quizzes.id],
  }),
  answers: many(questionsAnswers), 
}));

export const questionAnswersRelations = relations(questionsAnswers, ({ one }) => ({
  question: one(questions, {
    fields: [questionsAnswers.questionId],
    references: [questions.id],
  }),
}));

export const quizzSubmissions = pgTable("quizz_submissions", {
  id:serial("id").primaryKey(),
  quizzId: integer("quizz_id"),
  score: integer("score"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const quizzSubmissionsRelations = relations(quizzSubmissions,
  ({one, many}) => ({
    quizz:one(quizzes, {
      fields: [quizzSubmissions.quizzId],
      references: [quizzes.id],
    }),
    questionResponses: many(questionResponses),
  })
)

// New table for tracking question responses with confidence
export const questionResponses = pgTable("question_responses", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id").references(() => quizzSubmissions.id),
  questionId: integer("question_id").references(() => questions.id),
  selectedAnswerId: integer("selected_answer_id").references(() => questionsAnswers.id),
  confidence: confidenceLevel("confidence").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  learningState: learningState("learning_state").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const questionResponsesRelations = relations(questionResponses, ({ one, many }) => ({
  submission: one(quizzSubmissions, {
    fields: [questionResponses.submissionId],
    references: [quizzSubmissions.id],
  }),
  question: one(questions, {
    fields: [questionResponses.questionId],
    references: [questions.id],
  }),
  selectedAnswer: one(questionsAnswers, {
    fields: [questionResponses.selectedAnswerId],
    references: [questionsAnswers.id],
  }),
  explanations: many(aiExplanations),
  followUpQuestions: many(followUpQuestions),
}));

// Table for AI-generated explanations
export const aiExplanations = pgTable("ai_explanations", {
  id: serial("id").primaryKey(),
  responseId: integer("response_id").references(() => questionResponses.id),
  explanationText: text("explanation_text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiExplanationsRelations = relations(aiExplanations, ({ one }) => ({
  response: one(questionResponses, {
    fields: [aiExplanations.responseId],
    references: [questionResponses.id],
  }),
}));

// Table for follow-up questions
export const followUpQuestions = pgTable("follow_up_questions", {
  id: serial("id").primaryKey(),
  originalResponseId: integer("original_response_id").references(() => questionResponses.id),
  questionText: text("question_text").notNull(),
  concept: text("concept").notNull(),
  difficulty: text("difficulty").notNull(), // "easier", "same", "harder"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  answered: boolean("answered").default(false),
});

export const followUpQuestionsRelations = relations(followUpQuestions, ({ one }) => ({
  originalResponse: one(questionResponses, {
    fields: [followUpQuestions.originalResponseId],
    references: [questionResponses.id],
  }),
}));

// Table for spaced repetition scheduling
export const spacedRepetition = pgTable("spaced_repetition", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  questionId: integer("question_id").references(() => questions.id),
  concept: text("concept").notNull(),
  priority: integer("priority").notNull(), // 1-5, with 1 being highest priority
  nextReviewDate: timestamp("next_review_date").notNull(),
  lastReviewDate: timestamp("last_review_date"),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userQuestionUnique: unique().on(table.userId, table.questionId),
}));

export const spacedRepetitionRelations = relations(spacedRepetition, ({ one }) => ({
  user: one(users, {
    fields: [spacedRepetition.userId],
    references: [users.id],
  }),
  question: one(questions, {
    fields: [spacedRepetition.questionId],
    references: [questions.id],
  }),
}));
