import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { uuidv7 } from 'uuidv7';
import bcrypt from 'bcryptjs';
import { logger } from '../config/logger';

async function seed() {
  logger.info('🌱 Starting database seeding...');

  try {
    await connectDB();

    // 1. Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});

    // 2. Create Users
    const adminId = uuidv7();
    const instructorId = uuidv7();
    const studentId = uuidv7();

    const hashedPassword = await bcrypt.hash('Password1', 12);

    const users = [
      {
        _id: adminId,
        firstName: 'System',
        lastName: 'Admin',
        role: 'ADMIN',
        email: 'admin@example.com',
        hashedPassword,
        isVerified: true
      },
      {
        _id: instructorId,
        firstName: 'John',
        lastName: 'Instructor',
        role: 'INSTRUCTOR',
        email: 'instructor@example.com',
        hashedPassword,
        isVerified: true
      },
      {
        _id: studentId,
        firstName: 'Jane',
        lastName: 'Student',
        role: 'STUDENT',
        email: 'student@example.com',
        hashedPassword,
        isVerified: true
      }
    ];

    await User.insertMany(users);
    logger.info('✅ Users seeded successfully');

    // 3. Create Courses
    const courses = [
      {
        _id: uuidv7(),
        title: 'Full-Stack React Mastery',
        description: 'Build enterprise-grade applications with React, Node, and MongoDB.',
        price: 99.99,
        category: 'Development',
        instructorId: instructorId,
        isPublished: true,
      },
      {
        _id: uuidv7(),
        title: 'Advanced UI Design with Figma',
        description: 'Master the art of modern digital product design.',
        price: 79.99,
        category: 'Design',
        instructorId: instructorId,
        isPublished: true,
      },
      {
        _id: uuidv7(),
        title: 'Enterprise Architecture & Patterns',
        description: 'Learn how to scale applications for millions of users.',
        price: 129.99,
        category: 'Architecture',
        instructorId: adminId,
        isPublished: true,
      },
      {
        _id: uuidv7(),
        title: 'Cybersecurity Fundamentals',
        description: 'Protect your applications from modern threats.',
        price: 89.99,
        category: 'Security',
        instructorId: adminId,
        isPublished: true,
      },
      {
        _id: uuidv7(),
        title: 'Data Science with Python',
        description: 'Analyze and visualize data like a professional.',
        price: 109.99,
        category: 'Data Science',
        instructorId: instructorId,
        isPublished: true,
      }
    ];

    await Course.insertMany(courses);
    logger.info('✅ Courses seeded successfully');

    logger.info('🚀 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, '❌ Seeding failed');
    process.exit(1);
  }
}

seed();
