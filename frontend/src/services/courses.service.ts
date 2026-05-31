import api from '../utils/api';

export class CourseService {
  static getCourses(params?: any) {
    return api.get('/courses', { params });
  }
  static getCourse(id: string) {
    return api.get(`/courses/${id}`);
  }
  static getMyCourses() {
    return api.get('/courses/mine');
  }
  static getAnalytics() {
    return api.get('/courses/mine/analytics');
  }
  static createCourse(data: any) {
    return api.post('/courses', data);
  }
  static updateCourse(id: string, data: any) {
    return api.put(`/courses/${id}`, data);
  }
  static deleteCourse(id: string) {
    return api.delete(`/courses/${id}`);
  }
}
