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
        await db_1.db.transaction(async (tx) => {
            const existingQuiz = await tx.select().from(schema_1.quizzesTable).where((0, drizzle_orm_1.eq)(schema_1.quizzesTable.lessonId, lessonId)).limit(1);
            if (existingQuiz[0]) {
                await tx.delete(schema_1.quizzesTable).where((0, drizzle_orm_1.eq)(schema_1.quizzesTable.id, existingQuiz[0].id));
            }
            await tx.insert(schema_1.quizzesTable).values({ id: quizId, lessonId, title, passingScore: passingScore || 70 });
            for (const [qIdx, q] of questions.entries()) {
                const qId = (0, uuidv7_1.uuidv7)();
                await tx.insert(schema_1.questionsTable).values({ id: qId, quizId, text: q.text, order: qIdx });
                for (const opt of q.options) {
                    await tx.insert(schema_1.optionsTable).values({ id: (0, uuidv7_1.uuidv7)(), questionId: qId, text: opt.text, isCorrect: opt.isCorrect });
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
                questions: {
                    with: { options: true }
                }
            }
        });
        if (!quiz)
            throw new AppError_1.AppError('Quiz not found', 404);
        let correctCount = 0;
        const totalQuestions = quiz.questions.length;
        quiz.questions.forEach(q => {
            const studentOptionId = answers[q.id];
            const correctOption = q.options.find(o => o.isCorrect);
            if (correctOption && correctOption.id === studentOptionId) {
                correctCount++;
            }
        });
        const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
        const passed = totalQuestions > 0 ? score >= quiz.passingScore : false;
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