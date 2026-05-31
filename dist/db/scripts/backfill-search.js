"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const schema_1 = require("../db/schema");
const courses_search_1 = require("../modules/courses/courses.search");
const logger_1 = require("../config/logger");
const backfill = async () => {
    try {
        logger_1.logger.info('🚀 Starting Meilisearch backfill...');
        // 1. Fetch all courses
        const allCourses = await db_1.db.select().from(schema_1.coursesTable);
        logger_1.logger.info(`📋 Found ${allCourses.length} courses in database`);
        if (allCourses.length === 0) {
            logger_1.logger.info('✅ No courses to index. Finished.');
            process.exit(0);
        }
        // 2. Clear index (optional, but safer for a clean start)
        // await meili.index('courses').deleteAllDocuments();
        // 3. Batch index
        // Note: CourseSearch.indexCourse handles single documents. 
        // For backfill, we can do it in a loop or add a batch method.
        for (const course of allCourses) {
            await courses_search_1.CourseSearch.indexCourse(course);
        }
        logger_1.logger.info('✅ Backfill completed successfully');
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error({ error }, '❌ Backfill failed');
        process.exit(1);
    }
};
backfill();
//# sourceMappingURL=backfill-search.js.map