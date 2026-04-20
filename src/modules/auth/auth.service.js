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
        await db_1.db.transaction(async (tx) => {
            await tx.insert(schema_1.usersTable).values({
                id: newUserId,
                firstName,
                lastName,
                role: 'STUDENT',
            });
            await tx.insert(schema_1.userAuthTable).values({
                userId: newUserId,
                email,
                hashedPassword,
            });
        });
        return { id: newUserId };
    }
    static async login(data) {
        const { email, password } = data;
        const userAuthArr = await db_1.db.select().from(schema_1.userAuthTable).where((0, drizzle_orm_1.eq)(schema_1.userAuthTable.email, email)).limit(1);
        const userAuth = userAuthArr[0];
        if (!userAuth || !(await bcryptjs_1.default.compare(password, userAuth.hashedPassword))) {
            throw new AppError_1.AppError("Incorrect email or password", 401);
        }
        const userArr = await db_1.db.select().from(schema_1.usersTable).where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, userAuth.userId)).limit(1);
        const user = userArr[0];
        if (!user)
            throw new AppError_1.AppError('User record not found', 500);
        const { accessToken, refreshToken } = generateTokens(user.id, user.role);
        await db_1.db.update(schema_1.userAuthTable).set({ refreshToken }).where((0, drizzle_orm_1.eq)(schema_1.userAuthTable.userId, user.id));
        return { accessToken, refreshToken, user };
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
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map