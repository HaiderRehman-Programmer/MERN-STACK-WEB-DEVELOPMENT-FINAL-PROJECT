"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscussionService = void 0;
const db_1 = require("../../config/db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const uuidv7_1 = require("uuidv7");
class DiscussionService {
    static async createQuestion(lessonId, userId, content) {
        const id = (0, uuidv7_1.uuidv7)();
        await db_1.db.insert(schema_1.discussionsTable).values({ id, lessonId, userId, content });
        return { id };
    }
    static async createReply(discussionId, userId, content) {
        const id = (0, uuidv7_1.uuidv7)();
        await db_1.db.insert(schema_1.discussionRepliesTable).values({ id, discussionId, userId, content });
        return { id };
    }
    static async getByLesson(lessonId) {
        return await db_1.db.query.discussionsTable.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.discussionsTable.lessonId, lessonId),
            orderBy: [(0, drizzle_orm_1.desc)(schema_1.discussionsTable.createdAt)],
            with: {
                user: { columns: { firstName: true, lastName: true, role: true } },
                replies: {
                    orderBy: (replies, { asc }) => [asc(replies.createdAt)],
                    with: {
                        user: { columns: { firstName: true, lastName: true, role: true } }
                    }
                }
            }
        });
    }
}
exports.DiscussionService = DiscussionService;
//# sourceMappingURL=discussions.service.js.map