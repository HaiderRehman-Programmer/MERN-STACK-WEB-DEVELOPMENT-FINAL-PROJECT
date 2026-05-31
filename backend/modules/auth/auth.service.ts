import { AppError } from '../../utils/AppError';
import { uuidv7 } from 'uuidv7';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import crypto from 'crypto';
import { sendEmail } from '../../utils/email';
import fs from 'fs';
import path from 'path';
import { User } from '../../models/User';

const CLIENT_URL = env.CLIENT_URL || 'http://localhost:5000';

// Token generation logic moved to service
const generateTokens = (id: string, role: string) => {
  const accessToken = jwt.sign({ id, role }, env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id, role, type: 'REFRESH' }, env.JWT_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

export class AuthService {
  static async register(data: any) {
    const { firstName, lastName, email, password } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("Email is already registered", 400);
    }

    const newUserId = uuidv7();
    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // In development, auto-verify for easier testing/demo
    const isDev = env.NODE_ENV === 'development' || env.NODE_ENV === 'test';

    await User.create({
      _id: newUserId,
      firstName,
      lastName,
      email,
      hashedPassword,
      role: 'STUDENT',
      verificationToken: isDev ? undefined : verificationToken,
      isVerified: isDev ? true : false,
    });

    // Send Verification Email
    const verifyUrl = `${CLIENT_URL}/verify-email/${verificationToken}`;
    const message = `
      <h2>Welcome to our LMS!</h2>
      <p>Please click the link below to verify your email address and activate your account:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
    `;

    try {
      await sendEmail({
        to: email,
        subject: 'Please verify your email',
        html: message
      });
    } catch (err) {
      // Log error but don't fail registration
      console.error('Failed to send verification email:', err);
    }

    return { id: newUserId };
  }

  static async login(data: any) {
    const { email, password } = data;

    const user = await User.findOne({ email });

    if (!user || !user.hashedPassword || !(await bcrypt.compare(password, user.hashedPassword))) {
      throw new AppError("Incorrect email or password", 401);
    }

    if (!user.isVerified) {
      throw new AppError("Please verify your email before logging in", 401);
    }

    // 4. Check Ban Status
    if (user.isBanned) {
      throw new AppError('Your account has been suspended by an administrator.', 403);
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken, user };
  }

  static async refresh(refreshToken: string) {
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, env.JWT_SECRET);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError('Token rotation detected or token invalid', 401);
    }

    const accessToken = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: '15m' });
    return { accessToken };
  }

  static async forgotPassword(email: string) {
    const user = await User.findOne({ email });

    if (!user) return; // Silent return for security

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    user.resetToken = hashedResetToken;
    user.resetTokenExpiry = expiry;
    await user.save();

    const resetUrl = `${CLIENT_URL}/reset-password/${resetToken}`;
    const message = `
      <h2>Password Reset Request</h2>
      <p>Click the link below to securely create a new password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `;

    await sendEmail({
      to: user.email,
      subject: 'LMS Password Reset Request',
      html: message
    });
  }

  static async resetPassword(token: string, password: any) {
    const hashedResetToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({ resetToken: hashedResetToken });

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry.getTime() < Date.now()) {
      throw new AppError('Token is invalid or has expired', 400);
    }

    user.hashedPassword = await bcrypt.hash(password, 12);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
  }

  static async clearRefreshToken(refreshToken: string) {
    try {
      const decoded: any = jwt.decode(refreshToken);
      if (decoded && decoded.id) {
        await User.updateOne({ _id: decoded.id }, { $unset: { refreshToken: 1 } });
      }
    } catch {
      // Ignore errors during logout
    }
  }

  static async updateProfile(userId: string, data: { firstName?: string; lastName?: string }) {
    await User.updateOne({ _id: userId }, { $set: data });
    return { success: true };
  }

  static async changePassword(userId: string, data: any) {
    const { currentPassword, newPassword } = data;

    const user = await User.findById(userId);

    if (!user || !user.hashedPassword || !(await bcrypt.compare(currentPassword, user.hashedPassword))) {
      throw new AppError('Incorrect current password', 401);
    }

    user.hashedPassword = await bcrypt.hash(newPassword, 12);
    await user.save();

    return { success: true };
  }

  static async verifyEmail(token: string) {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return { success: true };
  }

  static async updateAvatar(userId: string, filename: string) {
    const user = await User.findById(userId);

    if (user?.avatarUrl) {
      const oldPath = path.join(process.cwd(), 'uploads', user.avatarUrl);
      if (fs.existsSync(oldPath)) {
        try {
          await fs.promises.unlink(oldPath);
        } catch (err) {
          console.error('Failed to delete old avatar:', err);
        }
      }
    }

    await User.updateOne({ _id: userId }, { $set: { avatarUrl: filename } });

    return { success: true, avatarUrl: filename };
  }
}
