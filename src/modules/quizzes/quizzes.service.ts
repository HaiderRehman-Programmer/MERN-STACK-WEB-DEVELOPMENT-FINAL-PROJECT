import { db } from '../../config/db';
import { quizzesTable, questionsTable, optionsTable, quizAttemptsTable, lessonsTable } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';
import { AppError } from '../../utils/AppError';

export class QuizService {
  static async createOrUpdate(data: any, instructorId: string) {
    const { lessonId, title, passingScore, questions } = data;

    const lesson = await db.query.lessonsTable.findFirst({
      where: eq(lessonsTable.id, lessonId),
      with: { course: true }
    });

    if (!lesson || lesson.course.instructorId !== instructorId) {
      throw new AppError('Lesson not found or unauthorized', 404);
    }

    if (!questions || questions.length === 0) {
      throw new AppError('A quiz must have at least one question', 400);
    }

    // Secondary validation: Each question must have at least one correct option
    for (const q of questions) {
      const hasCorrect = q.options?.some((o: any) => o.isCorrect);
      if (!hasCorrect) {
        throw new AppError(`Question "${q.text}" must have at least one correct answer`, 400);
      }
    }

    const quizId = uuidv7();
    await db.transaction(async (tx) => {
      const existingQuiz = await tx.select().from(quizzesTable).where(eq(quizzesTable.lessonId, lessonId)).limit(1);
      if (existingQuiz[0]) {
        await tx.delete(quizzesTable).where(eq(quizzesTable.id, existingQuiz[0].id));
      }

      await tx.insert(quizzesTable).values({ id: quizId, lessonId, title, passingScore: passingScore || 70 });

      for (const [qIdx, q] of questions.entries()) {
        const qId = uuidv7();
        await tx.insert(questionsTable).values({ id: qId, quizId, text: q.text, order: qIdx });
        for (const opt of q.options) {
          await tx.insert(optionsTable).values({ id: uuidv7(), questionId: qId, text: opt.text, isCorrect: opt.isCorrect });
        }
      }
    });

    return { quizId };
  }

  static async getByLesson(lessonId: string) {
    const quiz = await db.query.quizzesTable.findFirst({
      where: eq(quizzesTable.lessonId, lessonId),
      with: {
        questions: {
          orderBy: (questions, { asc }) => [asc(questions.order)],
          with: { options: true }
        }
      }
    });

    if (!quiz) return null;

    return {
      ...quiz,
      questions: quiz.questions.map(q => ({
        ...q,
        options: q.options.map(o => ({ id: o.id, text: o.text }))
      }))
    };
  }

  static async submitAttempt(quizId: string, answers: any, studentId: string) {
    const quiz = await db.query.quizzesTable.findFirst({
      where: eq(quizzesTable.id, quizId),
      with: {
        questions: {
          with: { options: true }
        }
      }
    });

    if (!quiz) throw new AppError('Quiz not found', 404);

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

    await db.insert(quizAttemptsTable).values({
      id: uuidv7(),
      studentId,
      quizId: quiz.id,
      score,
      passed,
    });

    return { score, passed, correctCount, totalQuestions };
  }
}
