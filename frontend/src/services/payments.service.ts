import api from '../utils/api';

export class PaymentService {
  static createCheckout(courseId: string) {
    return api.post('/payments/create-checkout', { courseId });
  }
  static verifySession(sessionId: string) {
    return api.get('/payments/verify-session', { params: { session_id: sessionId } });
  }
}
