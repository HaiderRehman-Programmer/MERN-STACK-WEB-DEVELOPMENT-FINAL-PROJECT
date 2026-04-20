import { db } from '../config/db';
import { coursesTable } from '../db/schema';
import { CourseSearch } from '../modules/courses/courses.search';
import { logger } from '../config/logger';

const backfill = async () => {
  try {
    logger.info('🚀 Starting Meilisearch backfill...');
    
    // 1. Fetch all courses
    const allCourses = await db.select().from(coursesTable);
    logger.info(`📋 Found ${allCourses.length} courses in database`);

    if (allCourses.length === 0) {
      logger.info('✅ No courses to index. Finished.');
      process.exit(0);
    }

    // 2. Clear index (optional, but safer for a clean start)
    // await meili.index('courses').deleteAllDocuments();

    // 3. Batch index
    // Note: CourseSearch.indexCourse handles single documents. 
    // For backfill, we can do it in a loop or add a batch method.
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
