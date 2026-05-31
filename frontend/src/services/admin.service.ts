import api from '../utils/api';

export class AdminService {
  static getUsers() {
    return api.get('/users');
  }
  static toggleUserBan(id: string, isBanned: boolean) {
    return api.patch(`/admin/users/${id}/ban`, { isBanned });
  }
  static updateUserRole(id: string, role: string) {
    return api.patch(`/admin/users/${id}/role`, { role });
  }
  static deleteUser(id: string) {
    return api.delete(`/users/${id}`);
  }
  static getStats() {
    return api.get('/admin/stats');
  }
  static getHealth() {
    return api.get('/admin/health');
  }
  static getModeration() {
    return api.get('/admin/moderation');
  }
  static moderationStrike(courseId: string, reason: string) {
    return api.post(`/admin/courses/${courseId}/strike`, { reason });
  }
  static deleteDiscussion(id: string) {
    return api.delete(`/admin/discussions/${id}`);
  }
  static deleteReply(id: string) {
    return api.delete(`/admin/replies/${id}`);
  }
}
