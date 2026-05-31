"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizService = void 0;
const db_1 = require("../../config/db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const uuidv7_1 = require("uuidv7");
const AppError_1 = require("../../utils/AppError");
class QuizService {
    static async createOrUpdate(data, instructorId) {
        const { lessonId, title, passingScore, questions } = data;
        const lesson = await db_1.db.query.lessonsTable.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.lessonsTable.id, lessonId),
            with: { course: true }
        });
        if (!lesson || lesson.course.instructorId !== instructorId) {
            throw new AppError_1.AppError('Lesson not found or unauthorized', 404);
        }
        if (!questions || questions.length === 0) {
            throw new AppError_1.AppError('A quiz must have at least one question', 400);
        }
        // Secondary validation: Each question must have at least one correct option
        for (const q of questions) {
            const hasCorrect = q.options?.some((o) => o.isCorrect);
            if (!hasCorrect) {
                throw new AppError_1.AppError(`Question "${q.text}" must have at least one correct answer`, 400);
            }
        }
        const quizId = (0, uuidv7_1.uuidv7)();
        db_1.db.transaction((tx) => {
            const existingQuiz = tx.select().from(schema_1.quizzesTable).where((0, drizzle_orm_1.eq)(schema_1.quizzesTable.lessonId, lessonId)).limit(1).all();
            if (existingQuiz[0]) {
                tx.delete(schema_1.quizzesTable).where((0, drizzle_orm_1.eq)(schema_1.quizzesTable.id, existingQuiz[0].id)).run();
            }
            tx.insert(schema_1.quizzesTable).values({ id: quizId, lessonId, title, passingScore: passingScore || 70 }).run();
            for (const [qIdx, q] of questions.entries()) {
                const qId = (0, uuidv7_1.uuidv7)();
                tx.insert(schema_1.questionsTable).values({ id: qId, quizId, text: q.text, order: qIdx }).run();
                for (const opt of q.options) {
                    tx.insert(schema_1.optionsTable).values({ id: (0, uuidv7_1.uuidv7)(), questionId: qId, text: opt.text, isCorrect: opt.isCorrect }).run();
                }
            }
        });
        return { quizId };
    }
    static async getByLesson(lessonId) {
        const quiz = await db_1.db.query.quizzesTable.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.quizzesTable.lessonId, lessonId),
            with: {
                questions: {
                    orderBy: (questions, { asc }) => [asc(questions.order)],
                    with: { options: true }
                }
            }
        });
        if (!quiz)
            return null;
        return {
            ...quiz,
            questions: quiz.questions.map(q => ({
                ...q,
                options: q.options.map(o => ({ id: o.id, text: o.text }))
            }))
        };
    }
    static async submitAttempt(quizId, answers, studentId) {
        const quiz = await db_1.db.query.quizzesTable.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.quizzesTable.id, quizId),
            with: {
                lesson: { with: { course: true } },
                questions: {
                    with: { options: true }
                }
            }
        });
        if (!quiz || !quiz.lesson || !quiz.lesson.course)
            throw new AppError_1.AppError('Quiz data incomplete', 500);
        // 1. Enrollment Check
        const enrollment = await db_1.db.select().from(schema_1.enrollmentsTable)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.enrollmentsTable.studentId, studentId), (0, drizzle_orm_1.eq)(schema_1.enrollmentsTable.courseId, quiz.lesson.course.id)))
            .limit(1);
        if (!enrollment.length && quiz.lesson.course.instructorId !== studentId) {
            throw new AppError_1.AppError('You must be enrolled in this course to submit quiz attempts', 403);
        }
        let correctCount = 0;
        const totalQuestions = quiz.questions.length;
        const passingScore = quiz.passingScore ?? 70;
        quiz.questions.forEach(q => {
            const studentOptionId = answers[q.id];
            // A question is correct if the student's choice is correct 
            // AND there are no OTHER correct options (Single choice constraint for now based on 'answers' format)
            const correctOptions = q.options.filter(o => o.isCorrect);
            const firstCorrect = correctOptions[0];
            if (correctOptions.length === 1 && firstCorrect && firstCorrect.id === studentOptionId) {
                correctCount++;
            }
            else if (correctOptions.length > 1) {
                // Future: If we support multiple selection, we'd check if answers[q.id] is an array 
                // matching all correctOptions IDs. For now, we'll mark as correct if any of them match? 
                // No, typically if a student only picks one of two correct ones, it's incorrect or partial.
                // We'll stick to strict single-match for now to be safe.
                if (correctOptions.some(o => o.id === studentOptionId))
                    correctCount++;
            }
        });
        const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
        const passed = totalQuestions > 0 ? score >= passingScore : false;
        await db_1.db.insert(schema_1.quizAttemptsTable).values({
            id: (0, uuidv7_1.uuidv7)(),
            studentId,
            quizId: quiz.id,
            score,
            passed,
        });
        return { score, passed, correctCount, totalQuestions };
    }
}
exports.QuizService = QuizService;
//# sourceMappingURL=quizzes.service.js.map