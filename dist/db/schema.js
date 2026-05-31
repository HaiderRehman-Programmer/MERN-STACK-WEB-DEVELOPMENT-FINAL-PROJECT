"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewsRelations = exports.enrollmentsRelations = exports.lessonProgressRelations = exports.quizAttemptsRelations = exports.optionsRelations = exports.questionsRelations = exports.quizzesRelations = exports.discussionRepliesRelations = exports.discussionsRelations = exports.lessonsRelations = exports.coursesRelations = exports.wishlistRelations = exports.usersRelations = exports.wishlistTable = exports.discussionRepliesTable = exports.discussionsTable = exports.quizAttemptsTable = exports.optionsTable = exports.questionsTable = exports.quizzesTable = exports.reviewsTable = exports.lessonProgressTable = exports.lessonsTable = exports.enrollmentsTable = exports.coursesTable = exports.userAuthTable = exports.usersTable = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const drizzle_orm_1 = require("drizzle-orm");
// Users Metadata Table
exports.usersTable = (0, sqlite_core_1.sqliteTable)('users', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    firstName: (0, sqlite_core_1.text)('first_name').notNull(),
    lastName: (0, sqlite_core_1.text)('last_name').notNull(),
    role: (0, sqlite_core_1.text)('role').notNull().default('STUDENT'), // STUDENT, INSTRUCTOR, ADMIN
    avatarUrl: (0, sqlite_core_1.text)('avatar_url'),
    isBanned: (0, sqlite_core_1.integer)('is_banned', { mode: 'boolean' }).notNull().default(false),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`),
});
// Users Authentication Identity Table
exports.userAuthTable = (0, sqlite_core_1.sqliteTable)('user_auth', {
    userId: (0, sqlite_core_1.text)('userId').primaryKey().references(() => exports.usersTable.id, { onDelete: 'cascade' }),
    email: (0, sqlite_core_1.text)('email').notNull().unique(),
    hashedPassword: (0, sqlite_core_1.text)('hashed_password').notNull(),
    refreshToken: (0, sqlite_core_1.text)('refresh_token'),
    resetToken: (0, sqlite_core_1.text)('reset_token'),
    resetTokenExpiry: (0, sqlite_core_1.integer)('reset_token_expiry', { mode: 'timestamp' }),
    verificationToken: (0, sqlite_core_1.text)('verification_token'),
    isVerified: (0, sqlite_core_1.integer)('is_verified', { mode: 'boolean' }).notNull().default(false),
});
// Courses Table
exports.coursesTable = (0, sqlite_core_1.sqliteTable)('courses', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    title: (0, sqlite_core_1.text)('title').notNull(),
    description: (0, sqlite_core_1.text)('description').notNull(),
    category: (0, sqlite_core_1.text)('category').notNull().default('Uncategorized'),
    price: (0, sqlite_core_1.real)('price').notNull().default(0.0),
    isPublished: (0, sqlite_core_1.integer)('is_published', { mode: 'boolean' }).notNull().default(false),
    instructorId: (0, sqlite_core_1.text)('instructorId').notNull().references(() => exports.usersTable.id, { onDelete: 'cascade' }),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`),
});
// Enrollments Table
exports.enrollmentsTable = (0, sqlite_core_1.sqliteTable)('enrollments', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    studentId: (0, sqlite_core_1.text)('studentId').notNull().references(() => exports.usersTable.id, { onDelete: 'cascade' }),
    courseId: (0, sqlite_core_1.text)('courseId').notNull().references(() => exports.coursesTable.id, { onDelete: 'cascade' }),
    status: (0, sqlite_core_1.text)('status').notNull().default('ACTIVE'), // ACTIVE, COMPLETED, DROPPED
    purchasedAt: (0, sqlite_core_1.integer)('purchased_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`),
}, (t) => ({
    unqStudentCourse: (0, sqlite_core_1.uniqueIndex)('idx_unique_student_course').on(t.studentId, t.courseId),
    idxPurchasedAt: (0, sqlite_core_1.index)('idx_enrollment_purchased').on(t.purchasedAt),
}));
// Lessons Table
exports.lessonsTable = (0, sqlite_core_1.sqliteTable)('lessons', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    title: (0, sqlite_core_1.text)('title').notNull(),
    content: (0, sqlite_core_1.text)('content'),
    videoUrl: (0, sqlite_core_1.text)('video_url'),
    isFreePreview: (0, sqlite_core_1.integer)('is_free_preview', { mode: 'boolean' }).notNull().default(false),
    orderIndex: (0, sqlite_core_1.integer)('order_index').notNull().default(0),
    courseId: (0, sqlite_core_1.text)('courseId').notNull().references(() => exports.coursesTable.id, { onDelete: 'cascade' }),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`),
});
// Lesson Progress Table (Tracks completion)
exports.lessonProgressTable = (0, sqlite_core_1.sqliteTable)('lesson_progress', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    studentId: (0, sqlite_core_1.text)('studentId').notNull().references(() => exports.usersTable.id, { onDelete: 'cascade' }),
    lessonId: (0, sqlite_core_1.text)('lessonId').notNull().references(() => exports.lessonsTable.id, { onDelete: 'cascade' }),
    isCompleted: (0, sqlite_core_1.integer)('is_completed', { mode: 'boolean' }).notNull().default(true),
    lastWatchedSeconds: (0, sqlite_core_1.real)('last_watched_seconds').notNull().default(0),
    completedAt: (0, sqlite_core_1.integer)('completed_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`),
}, (t) => ({
    unqStudentLesson: (0, sqlite_core_1.uniqueIndex)('idx_unique_student_lesson').on(t.studentId, t.lessonId),
    idxProgressCompletion: (0, sqlite_core_1.index)('idx_progress_completion').on(t.studentId, t.isCompleted),
}));
// Reviews Table
exports.reviewsTable = (0, sqlite_core_1.sqliteTable)('reviews', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    studentId: (0, sqlite_core_1.text)('studentId').notNull().references(() => exports.usersTable.id, { onDelete: 'cascade' }),
    courseId: (0, sqlite_core_1.text)('courseId').notNull().references(() => exports.coursesTable.id, { onDelete: 'cascade' }),
    rating: (0, sqlite_core_1.integer)('rating').notNull(), // 1-5
    comment: (0, sqlite_core_1.text)('comment'),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`),
}, (t) => ({
    unqStudentCourseReview: (0, sqlite_core_1.uniqueIndex)('idx_unique_student_course_review').on(t.studentId, t.courseId)
}));
// Quizzes Table
exports.quizzesTable = (0, sqlite_core_1.sqliteTable)('quizzes', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    lessonId: (0, sqlite_core_1.text)('lessonId').notNull().references(() => exports.lessonsTable.id, { onDelete: 'cascade' }).unique(),
    title: (0, sqlite_core_1.text)('title').notNull(),
    passingScore: (0, sqlite_core_1.integer)('passing_score').notNull().default(70),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`),
});
// Questions Table
exports.questionsTable = (0, sqlite_core_1.sqliteTable)('questions', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    quizId: (0, sqlite_core_1.text)('quizId').notNull().references(() => exports.quizzesTable.id, { onDelete: 'cascade' }),
    text: (0, sqlite_core_1.text)('text').notNull(),
    order: (0, sqlite_core_1.integer)('order').notNull().default(0),
});
// Options Table
exports.optionsTable = (0, sqlite_core_1.sqliteTable)('options', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    questionId: (0, sqlite_core_1.text)('questionId').notNull().references(() => exports.questionsTable.id, { onDelete: 'cascade' }),
    text: (0, sqlite_core_1.text)('text').notNull(),
    isCorrect: (0, sqlite_core_1.integer)('is_correct', { mode: 'boolean' }).notNull().default(false),
});
// Quiz Attempts Table
exports.quizAttemptsTable = (0, sqlite_core_1.sqliteTable)('quiz_attempts', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    studentId: (0, sqlite_core_1.text)('studentId').notNull().references(() => exports.usersTable.id, { onDelete: 'cascade' }),
    quizId: (0, sqlite_core_1.text)('quizId').notNull().references(() => exports.quizzesTable.id, { onDelete: 'cascade' }),
    score: (0, sqlite_core_1.real)('score').notNull(),
    passed: (0, sqlite_core_1.integer)('passed', { mode: 'boolean' }).notNull(),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`),
});
// Discussions Table (Questions)
exports.discussionsTable = (0, sqlite_core_1.sqliteTable)('discussions', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    lessonId: (0, sqlite_core_1.text)('lessonId').notNull().references(() => exports.lessonsTable.id, { onDelete: 'cascade' }),
    userId: (0, sqlite_core_1.text)('userId').notNull().references(() => exports.usersTable.id, { onDelete: 'cascade' }),
    content: (0, sqlite_core_1.text)('content').notNull(),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`),
});
// Discussion Replies Table
exports.discussionRepliesTable = (0, sqlite_core_1.sqliteTable)('discussion_replies', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    discussionId: (0, sqlite_core_1.text)('discussionId').notNull().references(() => exports.discussionsTable.id, { onDelete: 'cascade' }),
    userId: (0, sqlite_core_1.text)('userId').notNull().references(() => exports.usersTable.id, { onDelete: 'cascade' }),
    content: (0, sqlite_core_1.text)('content').notNull(),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`),
});
// Wishlist Table
exports.wishlistTable = (0, sqlite_core_1.sqliteTable)('wishlist', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    userId: (0, sqlite_core_1.text)('userId').notNull().references(() => exports.usersTable.id, { onDelete: 'cascade' }),
    courseId: (0, sqlite_core_1.text)('courseId').notNull().references(() => exports.coursesTable.id, { onDelete: 'cascade' }),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`),
}, (t) => ({
    unqUserCourse: (0, sqlite_core_1.uniqueIndex)('idx_unique_user_wishlist').on(t.userId, t.courseId),
}));
// --- Drizzle Relations ---
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.usersTable, ({ many }) => ({
    courses: many(exports.coursesTable),
    enrollments: many(exports.enrollmentsTable),
    progress: many(exports.lessonProgressTable),
    reviews: many(exports.reviewsTable),
    quizAttempts: many(exports.quizAttemptsTable),
    discussions: many(exports.discussionsTable),
    replies: many(exports.discussionRepliesTable),
    wishlist: many(exports.wishlistTable),
}));
exports.wishlistRelations = (0, drizzle_orm_1.relations)(exports.wishlistTable, ({ one }) => ({
    user: one(exports.usersTable, {
        fields: [exports.wishlistTable.userId],
        references: [exports.usersTable.id],
    }),
    course: one(exports.coursesTable, {
        fields: [exports.wishlistTable.courseId],
        references: [exports.coursesTable.id],
    }),
}));
exports.coursesRelations = (0, drizzle_orm_1.relations)(exports.coursesTable, ({ one, many }) => ({
    instructor: one(exports.usersTable, {
        fields: [exports.coursesTable.instructorId],
        references: [exports.usersTable.id],
    }),
    enrollments: many(exports.enrollmentsTable),
    lessons: many(exports.lessonsTable),
    reviews: many(exports.reviewsTable),
    wishlist: many(exports.wishlistTable),
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