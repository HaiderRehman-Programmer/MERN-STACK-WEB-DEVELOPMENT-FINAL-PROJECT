import { db } from '../../config/db';
import { usersTable, userAuthTable } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { AppError } from '../../utils/AppError';
import { uuidv7 } from 'uuidv7';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import crypto from 'crypto';
import { sendEmail } from '../../utils/email';

// Token generation logic moved to service
const generateTokens = (id: string, role: string) => {
  const accessToken = jwt.sign({ id, role }, env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id, role, type: 'REFRESH' }, env.JWT_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

export class AuthService {
  static async register(data: any) {
    const { firstName, lastName, email, password } = data;

    const existingUser = await db.select().from(userAuthTable).where(eq(userAuthTable.email, email)).limit(1);
    if (existingUser.length > 0) {
      throw new AppError("Email is already registered", 400);
    }

    const newUserId = uuidv7();
    const hashedPassword = await bcrypt.hash(password, 12);

    await db.transaction(async (tx) => {
      await tx.insert(usersTable).values({
        id: newUserId,
        firstName,
        lastName,
        role: 'STUDENT',
      });

      await tx.insert(userAuthTable).values({
        userId: newUserId,
        email,
        hashedPassword,
      });
    });

    return { id: newUserId };
  }

  static async login(data: any) {
    const { email, password } = data;

    const userAuthArr = await db.select().from(userAuthTable).where(eq(userAuthTable.email, email)).limit(1);
    const userAuth = userAuthArr[0];

    if (!userAuth || !(await bcrypt.compare(password, userAuth.hashedPassword))) {
      throw new AppError("Incorrect email or password", 401);
    }

    const userArr = await db.select().from(usersTable).where(eq(usersTable.id, userAuth.userId)).limit(1);
    const user = userArr[0];
    if (!user) throw new AppError('User record not found', 500);

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    await db.update(userAuthTable).set({ refreshToken }).where(eq(userAuthTable.userId, user.id));

    return { accessToken, refreshToken, user };
  }

  static async refresh(refreshToken: string) {
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, env.JWT_SECRET);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const authRecordArr = await db.select().from(userAuthTable).where(eq(userAuthTable.userId, decoded.id)).limit(1);
    const authRecord = authRecordArr[0];

    if (!authRecord || authRecord.refreshToken !== refreshToken) {
      throw new AppError('Token rotation detected or token invalid', 401);
    }

    const accessToken = jwt.sign({ id: decoded.id, role: decoded.role }, env.JWT_SECRET, { expiresIn: '15m' });
    return { accessToken };
  }

  static async forgotPassword(email: string) {
    const userAuthMap = await db.select().from(userAuthTable).where(eq(userAuthTable.email, email)).limit(1);
    const userAuth = userAuthMap[0];

    if (!userAuth) return; // Silent return for security

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    await db.update(userAuthTable)
      .set({ resetToken: hashedResetToken, resetTokenExpiry: expiry })
      .where(eq(userAuthTable.userId, userAuth.userId));

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    const message = `
      <h2>Password Reset Request</h2>
      <p>Click the link below to securely create a new password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `;

    await sendEmail({
      to: userAuth.email,
      subject: 'LMS Password Reset Request',
      html: message
    });
  }

  static async resetPassword(token: string, password: any) {
    const hashedResetToken = crypto.createHash('sha256').update(token).digest('hex');

    const userAuthMap = await db.select().from(userAuthTable)
      .where(eq(userAuthTable.resetToken, hashedResetToken))
      .limit(1);
      
    const userAuth = userAuthMap[0];

    if (!userAuth || !userAuth.resetTokenExpiry || userAuth.resetTokenExpiry.getTime() < Date.now()) {
      throw new AppError('Token is invalid or has expired', 400);
    }

    const newHashedPassword = await bcrypt.hash(password, 12);

    await db.update(userAuthTable)
      .set({
        hashedPassword: newHashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      })
      .where(eq(userAuthTable.userId, userAuth.userId));
  }

  static async clearRefreshToken(refreshToken: string) {
    try {
      const decoded: any = jwt.decode(refreshToken);
      if (decoded && decoded.id) {
        await db.update(userAuthTable).set({ refreshToken: null }).where(eq(userAuthTable.userId, decoded.id));
      }
    } catch {
      // Ignore errors during logout
    }
  }

  static async updateProfile(userId: string, data: { firstName?: string; lastName?: string }) {
    await db.update(usersTable)
      .set({ ...data })
      .where(eq(usersTable.id, userId));
    return { success: true };
  }

  static async changePassword(userId: string, data: any) {
    const { currentPassword, newPassword } = data;

    const authRecordArr = await db.select().from(userAuthTable).where(eq(userAuthTable.userId, userId)).limit(1);
    const authRecord = authRecordArr[0];

    if (!authRecord || !(await bcrypt.compare(currentPassword, authRecord.hashedPassword))) {
      throw new AppError('Incorrect current password', 401);
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    await db.update(userAuthTable)
      .set({ hashedPassword: hashedNewPassword })
      .where(eq(userAuthTable.userId, userId));

    return { success: true };
  }
}
