import { db } from '../../config/db';
import { discussionsTable, discussionRepliesTable } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';

export class DiscussionService {
  static async createQuestion(lessonId: string, userId: string, content: string) {
    const id = uuidv7();
    await db.insert(discussionsTable).values({ id, lessonId, userId, content });
    return { id };
  }

  static async createReply(discussionId: string, userId: string, content: string) {
    const id = uuidv7();
    await db.insert(discussionRepliesTable).values({ id, discussionId, userId, content });
    return { id };
  }

  static async getByLesson(lessonId: string) {
    return await db.query.discussionsTable.findMany({
      where: eq(discussionsTable.lessonId, lessonId),
      orderBy: [desc(discussionsTable.createdAt)],
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
