"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistService = void 0;
const db_1 = require("../../config/db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const AppError_1 = require("../../utils/AppError");
const uuidv7_1 = require("uuidv7");
class WishlistService {
    static async toggleWishlist(userId, courseId) {
        // 1. Check if already in wishlist
        const existing = await db_1.db.select()
            .from(schema_1.wishlistTable)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.wishlistTable.userId, userId), (0, drizzle_orm_1.eq)(schema_1.wishlistTable.courseId, courseId)))
            .limit(1);
        if (existing.length > 0) {
            // Remove from wishlist
            await db_1.db.delete(schema_1.wishlistTable)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.wishlistTable.userId, userId), (0, drizzle_orm_1.eq)(schema_1.wishlistTable.courseId, courseId)));
            return { favorited: false };
        }
        // 2. Add to wishlist
        // Optional: Check if course exists
        const course = await db_1.db.select().from(schema_1.coursesTable).where((0, drizzle_orm_1.eq)(schema_1.coursesTable.id, courseId)).limit(1);
        if (course.length === 0)
            throw new AppError_1.AppError('Course not found', 404);
        await db_1.db.insert(schema_1.wishlistTable).values({
            id: (0, uuidv7_1.uuidv7)(),
            userId,
            courseId,
        });
        return { favorited: true };
    }
    static async getWishlist(userId) {
        const list = await db_1.db.query.wishlistTable.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.wishlistTable.userId, userId),
            with: {
                course: {
                    with: {
                        instructor: true,
                    }
                },
            },
            orderBy: (wish, { desc }) => [desc(wish.createdAt)],
        });
        // Flatten to just return courses
        return list.map(item => item.course);
    }
}
exports.WishlistService = WishlistService;
//# sourceMappingURL=wishlist.service.js.map