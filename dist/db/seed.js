"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const schema_1 = require("./schema");
const uuidv7_1 = require("uuidv7");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const logger_1 = require("../config/logger");
async function seed() {
    logger_1.logger.info('🌱 Starting database seeding...');
    try {
        // 1. Clear existing data (Ensures clean re-run)
        await db_1.db.delete(schema_1.userAuthTable);
        await db_1.db.delete(schema_1.coursesTable);
        await db_1.db.delete(schema_1.usersTable);
        // 2. Create Users
        const adminId = (0, uuidv7_1.uuidv7)();
        const instructorId = (0, uuidv7_1.uuidv7)();
        const studentId = (0, uuidv7_1.uuidv7)();
        const hashedPassword = await bcryptjs_1.default.hash('password123', 12);
        const users = [
            {
                id: adminId,
                firstName: 'System',
                lastName: 'Admin',
                role: 'ADMIN',
            },
            {
                id: instructorId,
                firstName: 'John',
                lastName: 'Instructor',
                role: 'INSTRUCTOR',
            },
            {
                id: studentId,
                firstName: 'Jane',
                lastName: 'Student',
                role: 'STUDENT',
            }
        ];
        await db_1.db.insert(schema_1.usersTable).values(users);
        const auth = [
            { userId: adminId, email: 'admin@example.com', hashedPassword, isVerified: true },
            { userId: instructorId, email: 'instructor@example.com', hashedPassword, isVerified: true },
            { userId: studentId, email: 'student@example.com', hashedPassword, isVerified: true }
        ];
        await db_1.db.insert(schema_1.userAuthTable).values(auth);
        logger_1.logger.info('✅ Users seeded successfully');
        // 3. Create Courses
        const courses = [
            {
                id: (0, uuidv7_1.uuidv7)(),
                title: 'Full-Stack React Mastery',
                description: 'Build enterprise-grade applications with React, Node, and SQL.',
                price: 99.99,
                category: 'Development',
                instructorId: instructorId,
                isPublished: true,
            },
            {
                id: (0, uuidv7_1.uuidv7)(),
                title: 'Advanced UI Design with Figma',
                description: 'Master the art of modern digital product design.',
                price: 79.99,
                category: 'Design',
                instructorId: instructorId,
                isPublished: true,
            },
            {
                id: (0, uuidv7_1.uuidv7)(),
                title: 'Enterprise Architecture & Patterns',
                description: 'Learn how to scale applications for millions of users.',
                price: 129.99,
                category: 'Architecture',
                instructorId: adminId,
                isPublished: true,
            },
            {
                id: (0, uuidv7_1.uuidv7)(),
                title: 'Cybersecurity Fundamentals',
                description: 'Protect your applications from modern threats.',
                price: 89.99,
                category: 'Security',
                instructorId: adminId,
                isPublished: true,
            },
            {
                id: (0, uuidv7_1.uuidv7)(),
                title: 'Data Science with Python',
                description: 'Analyze and visualize data like a professional.',
                price: 109.99,
                category: 'Data Science',
                instructorId: instructorId,
                isPublished: true,
            }
        ];
        await db_1.db.insert(schema_1.coursesTable).values(courses);
        logger_1.logger.info('✅ Courses seeded successfully');
        logger_1.logger.info('🚀 Seeding completed successfully!');
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error({ error }, '❌ Seeding failed');
        process.exit(1);
    }
}
seed();
//# sourceMappingURL=seed.js.map