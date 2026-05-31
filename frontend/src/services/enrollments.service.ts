import api from '../utils/api';

export class EnrollmentService {
  static enrollFree(courseId: string) {
    return api.post('/enroll', { courseId });
  }
  static getCertificate(enrollmentId: string) {
    return api.get(`/enrollments/${enrollmentId}/certificate`);
  }
}
