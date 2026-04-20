import { pgTable, text, timestamp, uuid, integer, uniqueIndex, boolean, doublePrecision, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users Metadata Table
export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  role: text('role').notNull().default('STUDENT'), // STUDENT, INSTRUCTOR, ADMIN
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Users Authentication Identity Table
export const userAuthTable = pgTable('user_auth', {
  userId: uuid('user_id').primaryKey().references(() => usersTable.id, { onDelete: 'cascade' }),
  email: text('email').notNull().unique(),
  hashedPassword: text('hashed_password').notNull(),
  refreshToken: text('refresh_token'),
  resetToken: text('reset_token'),
  resetTokenExpiry: timestamp('reset_token_expiry', { withTimezone: true }),
});

// Courses Table
export const coursesTable = pgTable('courses', {
  id: uuid('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull().default('Uncategorized'),
  price: doublePrecision('price').notNull().default(0.0),
  isPublished: boolean('is_published').notNull().default(false),
  instructorId: uuid('instructor_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Enrollments Table
export const enrollmentsTable = pgTable('enrollments', {
  id: uuid('id').primaryKey(),
  studentId: uuid('student_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id').notNull().references(() => coursesTable.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, COMPLETED, DROPPED
  purchasedAt: timestamp('purchased_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  unqStudentCourse: uniqueIndex('idx_unique_student_course').on(t.studentId, t.courseId),
  idxPurchasedAt: index('idx_enrollment_purchased').on(t.purchasedAt),
}));

// Lessons Table
export const lessonsTable = pgTable('lessons', {
  id: uuid('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  videoUrl: text('video_url'),
  isFreePreview: boolean('is_free_preview').notNull().default(false),
  orderIndex: integer('order_index').notNull().default(0),
  courseId: uuid('course_id').notNull().references(() => coursesTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Lesson Progress Table (Tracks completion)
export const lessonProgressTable = pgTable('lesson_progress', {
  id: uuid('id').primaryKey(),
  studentId: uuid('student_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  lessonId: uuid('lesson_id').notNull().references(() => lessonsTable.id, { onDelete: 'cascade' }),
  isCompleted: boolean('is_completed').notNull().default(true),
  lastWatchedSeconds: doublePrecision('last_watched_seconds').notNull().default(0),
  completedAt: timestamp('completed_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  unqStudentLesson: uniqueIndex('idx_unique_student_lesson').on(t.studentId, t.lessonId),
  idxProgressCompletion: index('idx_progress_completion').on(t.studentId, t.isCompleted),
}));

// Reviews Table
export const reviewsTable = pgTable('reviews', {
  id: uuid('id').primaryKey(),
  studentId: uuid('student_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id').notNull().references(() => coursesTable.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  unqStudentCourseReview: uniqueIndex('idx_unique_student_course_review').on(t.studentId, t.courseId)
}));

// Quizzes Table
export const quizzesTable = pgTable('quizzes', {
  id: uuid('id').primaryKey(),
  lessonId: uuid('lesson_id').notNull().references(() => lessonsTable.id, { onDelete: 'cascade' }).unique(),
  title: text('title').notNull(),
  passingScore: integer('passing_score').notNull().default(70),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Questions Table
export const questionsTable = pgTable('questions', {
  id: uuid('id').primaryKey(),
  quizId: uuid('quiz_id').notNull().references(() => quizzesTable.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  order: integer('order').notNull().default(0),
});

// Options Table
export const optionsTable = pgTable('options', {
  id: uuid('id').primaryKey(),
  questionId: uuid('question_id').notNull().references(() => questionsTable.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  isCorrect: boolean('is_correct').notNull().default(false),
});

// Quiz Attempts Table
export const quizAttemptsTable = pgTable('quiz_attempts', {
  id: uuid('id').primaryKey(),
  studentId: uuid('student_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  quizId: uuid('quiz_id').notNull().references(() => quizzesTable.id, { onDelete: 'cascade' }),
  score: doublePrecision('score').notNull(),
  passed: boolean('passed').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Discussions Table (Questions)
export const discussionsTable = pgTable('discussions', {
  id: uuid('id').primaryKey(),
  lessonId: uuid('lesson_id').notNull().references(() => lessonsTable.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Discussion Replies Table
export const discussionRepliesTable = pgTable('discussion_replies', {
  id: uuid('id').primaryKey(),
  discussionId: uuid('discussion_id').notNull().references(() => discussionsTable.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// --- Drizzle Relations ---

export const usersRelations = relations(usersTable, ({ many }) => ({
  courses: many(coursesTable),
  enrollments: many(enrollmentsTable),
  progress: many(lessonProgressTable),
  reviews: many(reviewsTable),
  quizAttempts: many(quizAttemptsTable),
  discussions: many(discussionsTable),
  replies: many(discussionRepliesTable),
}));

export const coursesRelations = relations(coursesTable, ({ one, many }) => ({
  instructor: one(usersTable, {
    fields: [coursesTable.instructorId],
    references: [usersTable.id],
  }),
  enrollments: many(enrollmentsTable),
  lessons: many(lessonsTable),
  reviews: many(reviewsTable),
}));

export const lessonsRelations = relations(lessonsTable, ({ one, many }) => ({
  course: one(coursesTable, {
    fields: [lessonsTable.courseId],
    references: [coursesTable.id],
  }),
  progress: many(lessonProgressTable),
  quiz: one(quizzesTable, {
    fields: [lessonsTable.id],
    references: [quizzesTable.lessonId],
  }),
  discussions: many(discussionsTable),
}));

export const discussionsRelations = relations(discussionsTable, ({ one, many }) => ({
  lesson: one(lessonsTable, {
    fields: [discussionsTable.lessonId],
    references: [lessonsTable.id],
  }),
  user: one(usersTable, {
    fields: [discussionsTable.userId],
    references: [usersTable.id],
  }),
  replies: many(discussionRepliesTable),
}));

export const discussionRepliesRelations = relations(discussionRepliesTable, ({ one }) => ({
  discussion: one(discussionsTable, {
    fields: [discussionRepliesTable.discussionId],
    references: [discussionsTable.id],
  }),
  user: one(usersTable, {
    fields: [discussionRepliesTable.userId],
    references: [usersTable.id],
  }),
}));

export const quizzesRelations = relations(quizzesTable, ({ one, many }) => ({
  lesson: one(lessonsTable, {
    fields: [quizzesTable.lessonId],
    references: [lessonsTable.id],
  }),
  questions: many(questionsTable),
  attempts: many(quizAttemptsTable),
}));

export const questionsRelations = relations(questionsTable, ({ one, many }) => ({
  quiz: one(quizzesTable, {
    fields: [questionsTable.quizId],
    references: [quizzesTable.id],
  }),
  options: many(optionsTable),
}));

export const optionsRelations = relations(optionsTable, ({ one }) => ({
  question: one(questionsTable, {
    fields: [optionsTable.questionId],
    references: [questionsTable.id],
  }),
}));

export const quizAttemptsRelations = relations(quizAttemptsTable, ({ one }) => ({
  student: one(usersTable, {
    fields: [quizAttemptsTable.studentId],
    references: [usersTable.id],
  }),
  quiz: one(quizzesTable, {
    fields: [quizAttemptsTable.quizId],
    references: [quizzesTable.id],
  }),
}));

export const lessonProgressRelations = relations(lessonProgressTable, ({ one }) => ({
  student: one(usersTable, {
    fields: [lessonProgressTable.studentId],
    references: [usersTable.id],
  }),
  lesson: one(lessonsTable, {
    fields: [lessonProgressTable.lessonId],
    references: [lessonsTable.id],
  }),
}));

export const enrollmentsRelations = relations(enrollmentsTable, ({ one }) => ({
  student: one(usersTable, {
    fields: [enrollmentsTable.studentId],
    references: [usersTable.id],
  }),
  course: one(coursesTable, {
    fields: [enrollmentsTable.courseId],
    references: [coursesTable.id],
  }),
}));

export const reviewsRelations = relations(reviewsTable, ({ one }) => ({
  student: one(usersTable, {
    fields: [reviewsTable.studentId],
    references: [usersTable.id],
  }),
  course: one(coursesTable, {
    fields: [reviewsTable.courseId],
    references: [coursesTable.id],
  }),
}));
