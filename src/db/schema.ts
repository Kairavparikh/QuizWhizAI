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

// User role enum
export const userRole = pgEnum("user_role", ["STUDENT", "TEACHER"]);

// Enums for misconception system
export const misconceptionStatus = pgEnum("misconception_status", ["active", "resolving", "resolved"]);
export const misconceptionPatternType = pgEnum("misconception_pattern_type", [
  "cause_vs_effect",
  "variance_vs_bias",
  "correlation_vs_causation",
  "inverse_optimization",
  "keyword_matching",
  "temporal_confusion",
  "part_whole_confusion",
  "scope_confusion",
  "other"
]);
export const questionMisconceptionRelation = pgEnum("question_misconception_relation", ["reveals", "tests", "reinforces"]);

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
  role: userRole("role").default("STUDENT"),
})

export const userRelations = relations(users, ({many}) => ({
  quizzes: many(quizzes),
  teacherClasses: many(classes, { relationName: "teacherClasses" }),
  studentClassMembers: many(classMembers),
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

// Folders/Subjects for organizing quizzes
export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  userId: text("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const foldersRelations = relations(folders, ({ one, many }) => ({
  user: one(users, {
    fields: [folders.userId],
    references: [users.id],
  }),
  quizzes: many(quizzes),
}));

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  name: text("name"),
  description: text("description"),
  userId: text("user_id").references(() => users.id),
  folderId: integer("folder_id").references(() => folders.id),
  documentContent: text("document_content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

// Misconception tables for Adaptive Misconception Quizzing (AMQ)

// Main misconceptions table - tracks individual misconceptions per user
export const misconceptions = pgTable("misconceptions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  folderId: integer("folder_id").references(() => folders.id),
  concept: text("concept").notNull(), // e.g., "PCA objective function"
  misconceptionType: text("misconception_type").notNull(), // e.g., "Confuses high variance with low variance"
  description: text("description"), // Detailed description of the misconception
  status: misconceptionStatus("status").notNull().default("active"),
  strength: integer("strength").notNull().default(5), // 1-10, how strong this misconception is
  occurrenceCount: integer("occurrence_count").notNull().default(1), // How many times detected
  correctStreakCount: integer("correct_streak_count").notNull().default(0), // Correct answers in a row
  detectedAt: timestamp("detected_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
  lastTestedAt: timestamp("last_tested_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const misconceptionsRelations = relations(misconceptions, ({ one, many }) => ({
  user: one(users, {
    fields: [misconceptions.userId],
    references: [users.id],
  }),
  folder: one(folders, {
    fields: [misconceptions.folderId],
    references: [folders.id],
  }),
  questionMisconceptions: many(questionMisconceptions),
  misconceptionRelationships1: many(misconceptionRelationships, {
    relationName: "misconception1",
  }),
  misconceptionRelationships2: many(misconceptionRelationships, {
    relationName: "misconception2",
  }),
}));

// Meta-patterns across topics (e.g., always confuses cause vs effect)
export const misconceptionPatterns = pgTable("misconception_patterns", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  patternType: misconceptionPatternType("pattern_type").notNull(),
  description: text("description").notNull(),
  occurrenceCount: integer("occurrence_count").notNull().default(1),
  lastDetected: timestamp("last_detected").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const misconceptionPatternsRelations = relations(misconceptionPatterns, ({ one }) => ({
  user: one(users, {
    fields: [misconceptionPatterns.userId],
    references: [users.id],
  }),
}));

// Links questions to the misconceptions they reveal/test
export const questionMisconceptions = pgTable("question_misconceptions", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").references(() => questions.id).notNull(),
  misconceptionId: integer("misconception_id").references(() => misconceptions.id).notNull(),
  relationshipType: questionMisconceptionRelation("relationship_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const questionMisconceptionsRelations = relations(questionMisconceptions, ({ one }) => ({
  question: one(questions, {
    fields: [questionMisconceptions.questionId],
    references: [questions.id],
  }),
  misconception: one(misconceptions, {
    fields: [questionMisconceptions.misconceptionId],
    references: [misconceptions.id],
  }),
}));

// Relationships between misconceptions (for graph visualization)
export const misconceptionRelationships = pgTable("misconception_relationships", {
  id: serial("id").primaryKey(),
  misconceptionId1: integer("misconception_id_1").references(() => misconceptions.id).notNull(),
  misconceptionId2: integer("misconception_id_2").references(() => misconceptions.id).notNull(),
  relationshipType: text("relationship_type").notNull(), // "related_concept", "prerequisite", "opposite"
  strength: integer("strength").notNull().default(5), // 1-10
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const misconceptionRelationshipsRelations = relations(misconceptionRelationships, ({ one }) => ({
  misconception1: one(misconceptions, {
    relationName: "misconception1",
    fields: [misconceptionRelationships.misconceptionId1],
    references: [misconceptions.id],
  }),
  misconception2: one(misconceptions, {
    relationName: "misconception2",
    fields: [misconceptionRelationships.misconceptionId2],
    references: [misconceptions.id],
  }),
}));

// Teacher/Class Management System

// Classes created by teachers
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  teacherId: text("teacher_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  subject: text("subject"),
  semester: text("semester"),
  description: text("description"),
  joinCode: text("join_code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const classesRelations = relations(classes, ({ one, many }) => ({
  teacher: one(users, {
    relationName: "teacherClasses",
    fields: [classes.teacherId],
    references: [users.id],
  }),
  members: many(classMembers),
  assignments: many(quizAssignments),
}));

// Students enrolled in classes
export const classMembers = pgTable("class_members", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").references(() => classes.id).notNull(),
  studentId: text("student_id").references(() => users.id).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const classMembersRelations = relations(classMembers, ({ one }) => ({
  class: one(classes, {
    fields: [classMembers.classId],
    references: [classes.id],
  }),
  student: one(users, {
    fields: [classMembers.studentId],
    references: [users.id],
  }),
}));

// Quiz assignments for classes
export const quizAssignments = pgTable("quiz_assignments", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").references(() => classes.id).notNull(),
  quizId: integer("quiz_id").references(() => quizzes.id).notNull(),
  dueDate: timestamp("due_date"),
  status: text("status").default("active"), // "active", "completed", "archived"
  requireConfidence: boolean("require_confidence").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quizAssignmentsRelations = relations(quizAssignments, ({ one }) => ({
  class: one(classes, {
    fields: [quizAssignments.classId],
    references: [classes.id],
  }),
  quiz: one(quizzes, {
    fields: [quizAssignments.quizId],
    references: [quizzes.id],
  }),
}));
