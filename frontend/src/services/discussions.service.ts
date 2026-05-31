import api from '../utils/api';

export class DiscussionService {
  static getLessonDiscussions(lessonId: string) {
    return api.get(`/discussions/lesson/${lessonId}`);
  }
  static createQuestion(data: { lessonId: string; content: string }) {
    return api.post('/discussions/question', data);
  }
  static createReply(data: { discussionId: string; content: string }) {
    return api.post('/discussions/reply', data);
  }
  static deleteQuestion(id: string) {
    return api.delete(`/discussions/question/${id}`);
  }
  static deleteReply(id: string) {
    return api.delete(`/discussions/reply/${id}`);
  }
}
