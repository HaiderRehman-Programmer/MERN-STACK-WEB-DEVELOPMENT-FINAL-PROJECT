import api from '../utils/api';

export class LessonService {
  static getCourseLessons(courseId: string) {
    return api.get(`/lessons/course/${courseId}`);
  }
  static createLesson(data: any) {
    return api.post('/lessons', data);
  }
  static uploadVideo(formData: FormData, onUploadProgress?: (progressEvent: any) => void) {
    return api.post('/lessons/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress
    });
  }
  static updateLesson(id: string, data: any) {
    return api.patch(`/lessons/${id}`, data);
  }
  static deleteLesson(id: string) {
    return api.delete(`/lessons/${id}`);
  }
  static toggleCompletion(id: string) {
    return api.post(`/lessons/${id}/complete`);
  }
  static updateProgress(id: string, seconds: number) {
    return api.patch(`/lessons/${id}/progress`, { seconds });
  }
}
