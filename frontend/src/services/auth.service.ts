import api from '../utils/api';

export class AuthService {
  static login(data: any) {
    return api.post('/login', data);
  }
  static register(data: any) {
    return api.post('/register', data);
  }
  static getMe() {
    return api.get('/auth/me');
  }
  static getEnrollments() {
    return api.get('/my-courses');
  }
  static updateProfile(data: any) {
    return api.patch('/auth/me', data);
  }
  static updateAvatar(formData: FormData) {
    return api.patch('/auth/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  static changePassword(data: any) {
    return api.patch('/auth/change-password', data);
  }
  static forgotPassword(data: any) {
    return api.post('/auth/forgot-password', data);
  }
  static resetPassword(token: string, data: any) {
    return api.patch(`/auth/reset-password/${token}`, data);
  }
  static verifyEmail(token: string) {
    return api.get(`/auth/verify-email/${token}`);
  }
  static logout() {
    return api.post('/auth/logout');
  }
}
