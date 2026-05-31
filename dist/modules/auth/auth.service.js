"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const db_1 = require("../../config/db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const AppError_1 = require("../../utils/AppError");
const uuidv7_1 = require("uuidv7");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const crypto_1 = __importDefault(require("crypto"));
const email_1 = require("../../utils/email");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Token generation logic moved to service
const generateTokens = (id, role) => {
    const accessToken = jsonwebtoken_1.default.sign({ id, role }, env_1.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jsonwebtoken_1.default.sign({ id, role, type: 'REFRESH' }, env_1.env.JWT_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};
class AuthService {
    static async register(data) {
        const { firstName, lastName, email, password } = data;
        const existingUser = await db_1.db.select().from(schema_1.userAuthTable).where((0, drizzle_orm_1.eq)(schema_1.userAuthTable.email, email)).limit(1);
        if (existingUser.length > 0) {
            throw new AppError_1.AppError("Email is already registered", 400);
        }
        const newUserId = (0, uuidv7_1.uuidv7)();
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        db_1.db.transaction((tx) => {
            tx.insert(schema_1.usersTable).values({
                id: newUserId,
                firstName,
                lastName,
                role: 'STUDENT',
            }).run();
            tx.insert(schema_1.userAuthTable).values({
                userId: newUserId,
                email,
                hashedPassword,
                verificationToken,
                isVerified: false,
            }).run();
        });
        // Send Verification Email
        const verifyUrl = `http://localhost:5173/verify-email/${verificationToken}`;
        const message = `
      <h2>Welcome to our LMS!</h2>
      <p>Please click the link below to verify your email address and activate your account:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
    `;
        try {
            await (0, email_1.sendEmail)({
                to: email,
                subject: 'Please verify your email',
                html: message
            });
        }
        catch (err) {
            // Log error but don't fail registration
            console.error('Failed to send verification email:', err);
        }
        return { id: newUserId };
    }
    static async login(data) {
        const { email, password } = data;
        const userAuthArr = await db_1.db.select().from(schema_1.userAuthTable).where((0, drizzle_orm_1.eq)(schema_1.userAuthTable.email, email)).limit(1);
        const userAuth = userAuthArr[0];
        if (!userAuth || !(await bcryptjs_1.default.compare(password, userAuth.hashedPassword))) {
            throw new AppError_1.AppError("Incorrect email or password", 401);
        }
        if (!userAuth.isVerified) {
            throw new AppError_1.AppError("Please verify your email before logging in", 401);
        }
        // Hydrate User Profile for returning extra data and checking ban status
        const profileArr = await db_1.db.select().from(schema_1.usersTable).where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, userAuth.userId)).limit(1);
        const profile = profileArr[0];
        if (!profile)
            throw new AppError_1.AppError('User profile not found', 404);
        // 4. Check Ban Status
        if (profile.isBanned) {
            throw new AppError_1.AppError('Your account has been suspended by an administrator.', 403);
        }
        const { accessToken, refreshToken } = generateTokens(profile.id, profile.role);
        await db_1.db.update(schema_1.userAuthTable).set({ refreshToken }).where((0, drizzle_orm_1.eq)(schema_1.userAuthTable.userId, profile.id));
        return { accessToken, refreshToken, user: profile };
    }
    static async refresh(refreshToken) {
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.env.JWT_SECRET);
        }
        catch {
            throw new AppError_1.AppError('Invalid or expired refresh token', 401);
        }
        const authRecordArr = await db_1.db.select().from(schema_1.userAuthTable).where((0, drizzle_orm_1.eq)(schema_1.userAuthTable.userId, decoded.id)).limit(1);
        const authRecord = authRecordArr[0];
        if (!authRecord || authRecord.refreshToken !== refreshToken) {
            throw new AppError_1.AppError('Token rotation detected or token invalid', 401);
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: decoded.id, role: decoded.role }, env_1.env.JWT_SECRET, { expiresIn: '15m' });
        return { accessToken };
    }
    static async forgotPassword(email) {
        const userAuthMap = await db_1.db.select().from(schema_1.userAuthTable).where((0, drizzle_orm_1.eq)(schema_1.userAuthTable.email, email)).limit(1);
        const userAuth = userAuthMap[0];
        if (!userAuth)
            return; // Silent return for security
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const hashedResetToken = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
        const expiry = new Date(Date.now() + 60 * 60 * 1000);
        await db_1.db.update(schema_1.userAuthTable)
            .set({ resetToken: hashedResetToken, resetTokenExpiry: expiry })
            .where((0, drizzle_orm_1.eq)(schema_1.userAuthTable.userId, userAuth.userId));
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
        const message = `
      <h2>Password Reset Request</h2>
      <p>Click the link below to securely create a new password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `;
        await (0, email_1.sendEmail)({
            to: userAuth.email,
            subject: 'LMS Password Reset Request',
            html: message
        });
    }
    static async resetPassword(token, password) {
        const hashedResetToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const userAuthMap = await db_1.db.select().from(schema_1.userAuthTable)
            .where((0, drizzle_orm_1.eq)(schema_1.userAuthTable.resetToken, hashedResetToken))
            .limit(1);
        const userAuth = userAuthMap[0];
        if (!userAuth || !userAuth.resetTokenExpiry || userAuth.resetTokenExpiry.getTime() < Date.now()) {
            throw new AppError_1.AppError('Token is invalid or has expired', 400);
        }
        const newHashedPassword = await bcryptjs_1.default.hash(password, 12);
        await db_1.db.update(schema_1.userAuthTable)
            .set({
            hashedPassword: newHashedPassword,
            resetToken: null,
            resetTokenExpiry: null,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.userAuthTable.userId, userAuth.userId));
    }
    static async clearRefreshToken(refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.decode(refreshToken);
            if (decoded && decoded.id) {
                await db_1.db.update(schema_1.userAuthTable).set({ refreshToken: null }).where((0, drizzle_orm_1.eq)(schema_1.userAuthTable.userId, decoded.id));
            }
        }
        catch {
            // Ignore errors during logout
        }
    }
    static async updateProfile(userId, data) {
        await db_1.db.update(schema_1.usersTable)
            .set({ ...data })
            .where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, userId));
        return { success: true };
    }
    static async changePassword(userId, data) {
        const { currentPassword, newPassword } = data;
        const authRecordArr = await db_1.db.select().from(schema_1.userAuthTable).where((0, drizzle_orm_1.eq)(schema_1.userAuthTable.userId, userId)).limit(1);
        const authRecord = authRecordArr[0];
        if (!authRecord || !(await bcryptjs_1.default.compare(currentPassword, authRecord.hashedPassword))) {
            throw new AppError_1.AppError('Incorrect current password', 401);
        }
        const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, 12);
        await db_1.db.update(schema_1.userAuthTable)
            .set({ hashedPassword: hashedNewPassword })
            .where((0, drizzle_orm_1.eq)(schema_1.userAuthTable.userId, userId));
        return { success: true };
    }
    static async verifyEmail(token) {
        const userAuthArr = await db_1.db.select().from(schema_1.userAuthTable).where((0, drizzle_orm_1.eq)(schema_1.userAuthTable.verificationToken, token)).limit(1);
        const userAuth = userAuthArr[0];
        if (!userAuth) {
            throw new AppError_1.AppError('Invalid or expired verification token', 400);
        }
        await db_1.db.update(schema_1.userAuthTable)
            .set({ isVerified: true, verificationToken: null })
            .where((0, drizzle_orm_1.eq)(schema_1.userAuthTable.userId, userAuth.userId));
        return { success: true };
    }
    static async updateAvatar(userId, filename) {
        // 1. Get current user for cleanup
        const userArr = await db_1.db.select().from(schema_1.usersTable).where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, userId)).limit(1);
        const user = userArr[0];
        if (user?.avatarUrl) {
            // 2. Delete old file if exists
            const oldPath = path_1.default.join(process.cwd(), 'uploads', user.avatarUrl);
            if (fs_1.default.existsSync(oldPath)) {
                try {
                    await fs_1.default.promises.unlink(oldPath);
                }
                catch (err) {
                    console.error('Failed to delete old avatar:', err);
                }
            }
        }
        // 3. Update DB
        await db_1.db.update(schema_1.usersTable)
            .set({ avatarUrl: filename })
            .where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, userId));
        return { success: true, avatarUrl: filename };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map