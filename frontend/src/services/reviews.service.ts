import api from '../utils/api';

export class ReviewService {
  static getCourseReviews(courseId: string) {
    return api.get(`/reviews/course/${courseId}`);
  }
  static createOrUpdateReview(data: { courseId: string; rating: number; comment: string | null }) {
    return api.post('/reviews', data);
  }
  static deleteReview(id: string) {
    return api.delete(`/reviews/${id}`);
  }
}
