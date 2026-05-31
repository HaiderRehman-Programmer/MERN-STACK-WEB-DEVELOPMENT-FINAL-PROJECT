import api from '../utils/api';

export class QuizService {
  static getLessonQuiz(lessonId: string) {
    return api.get(`/quizzes/lesson/${lessonId}`);
  }
  static createOrUpdateQuiz(data: any) {
    return api.post('/quizzes', data);
  }
  static submitAttempt(quizId: string, answers: any) {
    return api.post(`/quizzes/${quizId}/submit`, { answers });
  }
}
