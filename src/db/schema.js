"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewsRelations = exports.enrollmentsRelations = exports.lessonProgressRelations = exports.quizAttemptsRelations = exports.optionsRelations = exports.questionsRelations = exports.quizzesRelations = exports.discussionRepliesRelations = exports.discussionsRelations = exports.lessonsRelations = exports.coursesRelations = exports.usersRelations = exports.discussionRepliesTable = exports.discussionsTable = exports.quizAttemptsTable = exports.optionsTable = exports.questionsTable = exports.quizzesTable = exports.reviewsTable = exports.lessonProgressTable = exports.lessonsTable = exports.enrollmentsTable = exports.coursesTable = exports.userAuthTable = exports.usersTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
// Users Metadata Table
exports.usersTable = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').primaryKey(),
    firstName: (0, pg_core_1.text)('first_name').notNull(),
    lastName: (0, pg_core_1.text)('last_name').notNull(),
    role: (0, pg_core_1.text)('role').notNull().default('STUDENT'), // STUDENT, INSTRUCTOR, ADMIN
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
// Users Authentication Identity Table
exports.userAuthTable = (0, pg_core_1.pgTable)('user_auth', {
    userId: (0, pg_core_1.uuid)('user_id').primaryKey().references(() => exports.usersTable.id, { onDelete: 'cascade' }),
    email: (0, pg_core_1.text)('email').notNull().unique(),
    hashedPassword: (0, pg_core_1.text)('hashed_password').notNull(),
    refreshToken: (0, pg_core_1.text)('refresh_token'),
    resetToken: (0, pg_core_1.text)('reset_token'),
    resetTokenExpiry: (0, pg_core_1.timestamp)('reset_token_expiry', { withTimezone: true }),
});
// Courses Table
exports.coursesTable = (0, pg_core_1.pgTable)('courses', {
    id: (0, pg_core_1.uuid)('id').primaryKey(),
    title: (0, pg_core_1.text)('title').notNull(),
    description: (0, pg_core_1.text)('description').notNull(),
    category: (0, pg_core_1.text)('category').notNull().default('Uncategorized'),
    price: (0, pg_core_1.doublePrecision)('price').notNull().default(0.0),
    isPublished: (0, pg_core_1.boolean)('is_published').notNull().default(false),
    instructorId: (0, pg_core_1.uuid)('instructor_id').notNull().references(() => exports.usersTable.id, { onDelete: 'cascade' }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
// Enrollments Table
exports.enrollmentsTable = (0, pg_core_1.pgTable)('enrollments', {
    id: (0, pg_core_1.uuid)('id').primaryKey(),
    studentId: (0, pg_core_1.uuid)('student_id').notNull().references(() => exports.usersTable.id, { onDelete: 'cascade' }),
    courseId: (0, pg_core_1.uuid)('course_id').notNull().references(() => exports.coursesTable.id, { onDelete: 'cascade' }),
    status: (0, pg_core_1.text)('status').notNull().default('ACTIVE'), // ACTIVE, COMPLETED, DROPPED
    purchasedAt: (0, pg_core_1.timestamp)('purchased_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
    unqStudentCourse: (0, pg_core_1.uniqueIndex)('idx_unique_student_course').on(t.studentId, t.courseId),
    idxPurchasedAt: (0, pg_core_1.index)('idx_enrollment_purchased').on(t.purchasedAt),
}));
// Lessons Table
exports.lessonsTable = (0, pg_core_1.pgTable)('lessons', {
    id: (0, pg_core_1.uuid)('id').primaryKey(),
    title: (0, pg_core_1.text)('title').notNull(),
    content: (0, pg_core_1.text)('content'),
    videoUrl: (0, pg_core_1.text)('video_url'),
    isFreePreview: (0, pg_core_1.boolean)('is_free_preview').notNull().default(false),
    orderIndex: (0, pg_core_1.integer)('order_index').notNull().default(0),
    courseId: (0, pg_core_1.uuid)('course_id').notNull().references(() => exports.coursesTable.id, { onDelete: 'cascade' }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
// Lesson Progress Table (Tracks completion)
exports.lessonProgressTable = (0, pg_core_1.pgTable)('lesson_progress', {
    id: (0, pg_core_1.uuid)('id').primaryKey(),
    studentId: (0, pg_core_1.uuid)('student_id').notNull().references(() => exports.usersTable.id, { onDelete: 'cascade' }),
    lessonId: (0, pg_core_1.uuid)('lesson_id').notNull().references(() => exports.lessonsTable.id, { onDelete: 'cascade' }),
    isCompleted: (0, pg_core_1.boolean)('is_completed').notNull().default(true),
    lastWatchedSeconds: (0, pg_core_1.doublePrecision)('last_watched_seconds').notNull().default(0),
    completedAt: (0, pg_core_1.timestamp)('completed_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
    unqStudentLesson: (0, pg_core_1.uniqueIndex)('idx_unique_student_lesson').on(t.studentId, t.lessonId),
    idxProgressCompletion: (0, pg_core_1.index)('idx_progress_completion').on(t.studentId, t.isCompleted),
}));
// Reviews Table
exports.reviewsTable = (0, pg_core_1.pgTable)('reviews', {
    id: (0, pg_core_1.uuid)('id').primaryKey(),
    studentId: (0, pg_core_1.uuid)('student_id').notNull().references(() => exports.usersTable.id, { onDelete: 'cascade' }),
    courseId: (0, pg_core_1.uuid)('course_id').notNull().references(() => exports.coursesTable.id, { onDelete: 'cascade' }),
    rating: (0, pg_core_1.integer)('rating').notNull(), // 1-5
    comment: (0, pg_core_1.text)('comment'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
    unqStudentCourseReview: (0, pg_core_1.uniqueIndex)('idx_unique_student_course_review').on(t.studentId, t.courseId)
}));
// Quizzes Table
exports.quizzesTable = (0, pg_core_1.pgTable)('quizzes', {
    id: (0, pg_core_1.uuid)('id').primaryKey(),
    lessonId: (0, pg_core_1.uuid)('lesson_id').notNull().references(() => exports.lessonsTable.id, { onDelete: 'cascade' }).unique(),
    title: (0, pg_core_1.text)('title').notNull(),
    passingScore: (0, pg_core_1.integer)('passing_score').notNull().default(70),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
});
// Questions Table
exports.questionsTable = (0, pg_core_1.pgTable)('questions', {
    id: (0, pg_core_1.uuid)('id').primaryKey(),
    quizId: (0, pg_core_1.uuid)('quiz_id').notNull().references(() => exports.quizzesTable.id, { onDelete: 'cascade' }),
    text: (0, pg_core_1.text)('text').notNull(),
    order: (0, pg_core_1.integer)('order').notNull().default(0),
});
// Options Table
exports.optionsTable = (0, pg_core_1.pgTable)('options', {
    id: (0, pg_core_1.uuid)('id').primaryKey(),
    questionId: (0, pg_core_1.uuid)('question_id').notNull().references(() => exports.questionsTable.id, { onDelete: 'cascade' }),
    text: (0, pg_core_1.text)('text').notNull(),
    isCorrect: (0, pg_core_1.boolean)('is_correct').notNull().default(false),
});
// Quiz Attempts Table
exports.quizAttemptsTable = (0, pg_core_1.pgTable)('quiz_attempts', {
    id: (0, pg_core_1.uuid)('id').primaryKey(),
    studentId: (0, pg_core_1.uuid)('student_id').notNull().references(() => exports.usersTable.id, { onDelete: 'cascade' }),
    quizId: (0, pg_core_1.uuid)('quiz_id').notNull().references(() => exports.quizzesTable.id, { onDelete: 'cascade' }),
    score: (0, pg_core_1.doublePrecision)('score').notNull(),
    passed: (0, pg_core_1.boolean)('passed').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
});
// Discussions Table (Questions)
exports.discussionsTable = (0, pg_core_1.pgTable)('discussions', {
    id: (0, pg_core_1.uuid)('id').primaryKey(),
    lessonId: (0, pg_core_1.uuid)('lesson_id').notNull().references(() => exports.lessonsTable.id, { onDelete: 'cascade' }),
    userId: (0, pg_core_1.uuid)('user_id').notNull().references(() => exports.usersTable.id, { onDelete: 'cascade' }),
    content: (0, pg_core_1.text)('content').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
});
// Discussion Replies Table
exports.discussionRepliesTable = (0, pg_core_1.pgTable)('discussion_replies', {
    id: (0, pg_core_1.uuid)('id').primaryKey(),
    discussionId: (0, pg_core_1.uuid)('discussion_id').notNull().references(() => exports.discussionsTable.id, { onDelete: 'cascade' }),
    userId: (0, pg_core_1.uuid)('user_id').notNull().references(() => exports.usersTable.id, { onDelete: 'cascade' }),
    content: (0, pg_core_1.text)('content').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
});
// --- Drizzle Relations ---
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.usersTable, ({ many }) => ({
    courses: many(exports.coursesTable),
    enrollments: many(exports.enrollmentsTable),
    progress: many(exports.lessonProgressTable),
    reviews: many(exports.reviewsTable),
    quizAttempts: many(exports.quizAttemptsTable),
    discussions: many(exports.discussionsTable),
    replies: many(exports.discussionRepliesTable),
}));
exports.coursesRelations = (0, drizzle_orm_1.relations)(exports.coursesTable, ({ one, many }) => ({
    instructor: one(exports.usersTable, {
        fields: [exports.coursesTable.instructorId],
        references: [exports.usersTable.id],
    }),
    enrollments: many(exports.enrollmentsTable),
    lessons: many(exports.lessonsTable),
    reviews: many(exports.reviewsTable),
}));
exports.lessonsRelations = (0, drizzle_orm_1.relations)(exports.lessonsTable, ({ one, many }) => ({
    course: one(exports.coursesTable, {
        fields: [exports.lessonsTable.courseId],
        references: [exports.coursesTable.id],
    }),
    progress: many(exports.lessonProgressTable),
    quiz: one(exports.quizzesTable, {
        fields: [exports.lessonsTable.id],
        references: [exports.quizzesTable.lessonId],
    }),
    discussions: many(exports.discussionsTable),
}));
exports.discussionsRelations = (0, drizzle_orm_1.relations)(exports.discussionsTable, ({ one, many }) => ({
    lesson: one(exports.lessonsTable, {
        fields: [exports.discussionsTable.lessonId],
        references: [exports.lessonsTable.id],
    }),
    user: one(exports.usersTable, {
        fields: [exports.discussionsTable.userId],
        references: [exports.usersTable.id],
    }),
    replies: many(exports.discussionRepliesTable),
}));
exports.discussionRepliesRelations = (0, drizzle_orm_1.relations)(exports.discussionRepliesTable, ({ one }) => ({
    discussion: one(exports.discussionsTable, {
        fields: [exports.discussionRepliesTable.discussionId],
        references: [exports.discussionsTable.id],
    }),
    user: one(exports.usersTable, {
        fields: [exports.discussionRepliesTable.userId],
        references: [exports.usersTable.id],
    }),
}));
exports.quizzesRelations = (0, drizzle_orm_1.relations)(exports.quizzesTable, ({ one, many }) => ({
    lesson: one(exports.lessonsTable, {
        fields: [exports.quizzesTable.lessonId],
        references: [exports.lessonsTable.id],
    }),
    questions: many(exports.questionsTable),
    attempts: many(exports.quizAttemptsTable),
}));
exports.questionsRelations = (0, drizzle_orm_1.relations)(exports.questionsTable, ({ one, many }) => ({
    quiz: one(exports.quizzesTable, {
        fields: [exports.questionsTable.quizId],
        references: [exports.quizzesTable.id],
    }),
    options: many(exports.optionsTable),
}));
exports.optionsRelations = (0, drizzle_orm_1.relations)(exports.optionsTable, ({ one }) => ({
    question: one(exports.questionsTable, {
        fields: [exports.optionsTable.questionId],
        references: [exports.questionsTable.id],
    }),
}));
exports.quizAttemptsRelations = (0, drizzle_orm_1.relations)(exports.quizAttemptsTable, ({ one }) => ({
    student: one(exports.usersTable, {
        fields: [exports.quizAttemptsTable.studentId],
        references: [exports.usersTable.id],
    }),
    quiz: one(exports.quizzesTable, {
        fields: [exports.quizAttemptsTable.quizId],
        references: [exports.quizzesTable.id],
    }),
}));
exports.lessonProgressRelations = (0, drizzle_orm_1.relations)(exports.lessonProgressTable, ({ one }) => ({
    student: one(exports.usersTable, {
        fields: [exports.lessonProgressTable.studentId],
        references: [exports.usersTable.id],
    }),
    lesson: one(exports.lessonsTable, {
        fields: [exports.lessonProgressTable.lessonId],
        references: [exports.lessonsTable.id],
    }),
}));
exports.enrollmentsRelations = (0, drizzle_orm_1.relations)(exports.enrollmentsTable, ({ one }) => ({
    student: one(exports.usersTable, {
        fields: [exports.enrollmentsTable.studentId],
        references: [exports.usersTable.id],
    }),
    course: one(exports.coursesTable, {
        fields: [exports.enrollmentsTable.courseId],
        references: [exports.coursesTable.id],
    }),
}));
exports.reviewsRelations = (0, drizzle_orm_1.relations)(exports.reviewsTable, ({ one }) => ({
    student: one(exports.usersTable, {
        fields: [exports.reviewsTable.studentId],
        references: [exports.usersTable.id],
    }),
    course: one(exports.coursesTable, {
        fields: [exports.reviewsTable.courseId],
        references: [exports.coursesTable.id],
    }),
}));
//# sourceMappingURL=schema.js.map