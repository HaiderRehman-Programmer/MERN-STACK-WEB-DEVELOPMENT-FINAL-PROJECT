import api from '../utils/api';

export class WishlistService {
  static getWishlist() {
    return api.get('/wishlist');
  }
  static toggleWishlist(courseId: string) {
    return api.post(`/wishlist/${courseId}`);
  }
}
