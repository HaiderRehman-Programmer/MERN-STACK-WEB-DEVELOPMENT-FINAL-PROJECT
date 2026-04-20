import { db } from '../../config/db';
import { usersTable, userAuthTable, coursesTable, enrollmentsTable } from '../../db/schema';
import { eq, count, sql } from 'drizzle-orm';
import { meili } from '../../config/meilisearch';
import { AppError } from '../../utils/AppError';

export class AdminService {
  static async getAllUsers() {
    return await db
      .select({
        id: usersTable.id,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        role: usersTable.role,
        email: userAuthTable.email,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .innerJoin(userAuthTable, eq(usersTable.id, userAuthTable.userId));
  }

  static async updateUserRole(userId: string, role: string) {
    const validRoles = ['STUDENT', 'INSTRUCTOR', 'ADMIN'];
    if (!validRoles.includes(role)) {
      throw new AppError(`Invalid role. Must be one of: ${validRoles.join(', ')}`, 400);
    }

    const userArr = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!userArr.length) {
      throw new AppError('User not found', 404);
    }

    await db.update(usersTable).set({ role }).where(eq(usersTable.id, userId));
    return { id: userId, role };
  }

  static async getGlobalStats() {
    const userCount = await db.select({ value: count() }).from(usersTable);
    const courseCount = await db.select({ value: count() }).from(coursesTable);
    const enrollmentCount = await db.select({ value: count() }).from(enrollmentsTable);

    return {
      users: Number(userCount[0]?.value ?? 0),
      courses: Number(courseCount[0]?.value ?? 0),
      enrollments: Number(enrollmentCount[0]?.value ?? 0),
    };
  }

  static async getSystemHealth() {
    const start = Date.now();
    try {
      // 1. Check DB latency
      await db.execute(sql`SELECT 1`);
      const dbLatency = Date.now() - start;

      // 2. Check Meilisearch
      let meiliStatus = 'offline';
      try {
        const health = await meili.isHealthy();
        if (health) meiliStatus = 'online';
      } catch (e) {
        meiliStatus = 'error';
      }

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
          database: { status: 'connected', latency: `${dbLatency}ms` },
          search: { status: meiliStatus },
        }
      };
    } catch (error) {
      return {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
