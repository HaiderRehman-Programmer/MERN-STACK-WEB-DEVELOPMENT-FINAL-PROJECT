import { connectDB } from '../config/db';
import { Course } from '../models/Course';
import { CourseSearch } from '../modules/courses/courses.search';
import { logger } from '../config/logger';

const backfill = async () => {
  try {
    logger.info('🚀 Starting Meilisearch backfill...');
    
    // Connect to Database
    await connectDB();
    
    // Initialize search index settings
    await CourseSearch.init();
    
    // 1. Fetch all courses
    const allCourses = await Course.find();
    logger.info(`📋 Found ${allCourses.length} courses in database`);

    if (allCourses.length === 0) {
      logger.info('✅ No courses to index. Finished.');
      process.exit(0);
    }

    // 2. Batch index
    for (const course of allCourses) {
      await CourseSearch.indexCourse(course);
    }

    logger.info('✅ Backfill completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, '❌ Backfill failed');
    process.exit(1);
  }
};

backfill();
