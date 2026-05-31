import { AppError } from '../../utils/AppError';
import { Course } from '../../models/Course';
import { Lesson } from '../../models/Lesson';
import { Quiz } from '../../models/Quiz';
import { QuizAttempt } from '../../models/QuizAttempt';
import { Enrollment } from '../../models/Enrollment';

export class QuizService {
  static async createOrUpdate(data: any, instructorId: string) {
    const { lessonId, title, passingScore, questions } = data;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) throw new AppError('Lesson not found', 404);
    
    const course = await Course.findOne({ _id: lesson.courseId, instructorId });
    if (!course) throw new AppError('Lesson not found or unauthorized', 404);

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

    await Quiz.findOneAndDelete({ lessonId });

    const quiz = await Quiz.create({
      lessonId,
      title,
      passingScore: passingScore || 70,
      questions
    });

    return { quizId: quiz._id };
  }

  static async getByLesson(lessonId: string) {
    const quiz = await Quiz.findOne({ lessonId });
    if (!quiz) return null;

    // Convert to object and sanitize options (remove isCorrect for student view)
    const quizObj = quiz.toJSON();
    
    if (quizObj.questions) {
      quizObj.questions.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      quizObj.questions.forEach((q: any) => {
        if (q.options) {
          q.options.forEach((o: any) => {
            delete o.isCorrect;
          });
        }
      });
    }

    return quizObj;
  }

  static async submitAttempt(quizId: string, answers: any, studentId: string) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw new AppError('Quiz not found', 404);

    const lesson = await Lesson.findById(quiz.lessonId);
    if (!lesson) throw new AppError('Quiz data incomplete', 500);

    const enrollment = await Enrollment.findOne({ studentId, courseId: lesson.courseId });
    const course = await Course.findById(lesson.courseId);

    if (!enrollment && course?.instructorId !== studentId) {
      throw new AppError('You must be enrolled in this course to submit quiz attempts', 403);
    }

    let correctCount = 0;
    const totalQuestions = quiz.questions.length;
    const passingScore = quiz.passingScore ?? 70;

    quiz.questions.forEach((q: any) => {
      const studentOptionId = answers[q._id] || answers[q.id];
      const correctOptions = q.options.filter((o: any) => o.isCorrect);
      const firstCorrect = correctOptions[0];
      
      if (correctOptions.length === 1 && firstCorrect && (firstCorrect._id || firstCorrect.id) === studentOptionId) {
        correctCount++;
      } else if (correctOptions.length > 1) {
        if (correctOptions.some((o: any) => (o._id || o.id) === studentOptionId)) correctCount++;
      }
    });

    const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const passed = totalQuestions > 0 ? score >= passingScore : false;

    await QuizAttempt.create({
      studentId,
      quizId,
      score,
      passed
    });

    return { score, passed, correctCount, totalQuestions };
  }
}
