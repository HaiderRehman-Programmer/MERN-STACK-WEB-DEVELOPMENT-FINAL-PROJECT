export declare class WishlistService {
    static toggleWishlist(userId: string, courseId: string): Promise<{
        favorited: boolean;
    }>;
    static getWishlist(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        category: string;
        price: number;
        isPublished: boolean;
        instructorId: string;
        instructor: {
            firstName: string;
            lastName: string;
            id: string;
            role: string;
            avatarUrl: string | null;
            isBanned: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }[]>;
}
//# sourceMappingURL=wishlist.service.d.ts.map