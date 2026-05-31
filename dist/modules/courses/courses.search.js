"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseSearch = void 0;
const meilisearch_1 = require("../../config/meilisearch");
const logger_1 = require("../../config/logger");
const db_1 = require("../../config/db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const COURSE_INDEX = 'courses';
class CourseSearch {
    static isOperational = false;
    static async init() {
        try {
            // Test connectivity by getting index or checking health
            await meilisearch_1.meili.health();
            const index = meilisearch_1.meili.index(COURSE_INDEX);
            await index.updateSettings({
                searchableAttributes: ['title', 'description', 'category'],
                filterableAttributes: ['category', 'isPublished'],
                rankingRules: [
                    'words',
                    'typo',
                    'proximity',
                    'attribute',
                    'sort',
                    'exactness',
                ],
            });
            this.isOperational = true;
            logger_1.logger.info('🔍 Meilisearch index settings updated and active');
        }
        catch (error) {
            this.isOperational = false;
            logger_1.logger.warn('⚠️ Meilisearch unreachable. Falling back to SQLite search.');
        }
    }
    static async indexCourse(course) {
        if (!this.isOperational)
            return;
        try {
            await meilisearch_1.meili.index(COURSE_INDEX).addDocuments([
                {
                    id: course.id,
                    title: course.title,
                    description: course.description,
                    category: course.category,
                    isPublished: course.isPublished,
                },
            ]);
        }
        catch (error) {
            logger_1.logger.error({ error, courseId: course.id }, '❌ Failed to index course in Meilisearch');
        }
    }
    static async removeCourse(courseId) {
        if (!this.isOperational)
            return;
        try {
            await meilisearch_1.meili.index(COURSE_INDEX).deleteDocument(courseId);
        }
        catch (error) {
            logger_1.logger.error({ error, courseId }, '❌ Failed to remove course from Meilisearch');
        }
    }
    static async searchCourses(query, category) {
        if (!this.isOperational) {
            return this.fallbackSearch(query, category);
        }
        try {
            const filter = [];
            filter.push('isPublished = true');
            if (category && category !== 'All') {
                filter.push(`category = "${category}"`);
            }
            const results = await meilisearch_1.meili.index(COURSE_INDEX).search(query, {
                filter: filter.join(' AND '),
            });
            return results.hits.map((hit) => hit.id);
        }
        catch (error) {
            logger_1.logger.error({ error, query }, '❌ Meilisearch search failed. Attempting fallback.');
            return this.fallbackSearch(query, category);
        }
    }
    static async fallbackSearch(query, category) {
        try {
            const searchPattern = `%${query}%`;
            const results = await db_1.db
                .select({ id: schema_1.coursesTable.id })
                .from(schema_1.coursesTable)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.coursesTable.isPublished, true), category && category !== 'All' ? (0, drizzle_orm_1.eq)(schema_1.coursesTable.category, category) : undefined, (0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(schema_1.coursesTable.title, searchPattern), (0, drizzle_orm_1.like)(schema_1.coursesTable.description, searchPattern))));
            return results.map((r) => r.id);
        }
        catch (error) {
            logger_1.logger.error({ error, query }, '❌ SQLite fallback search failed');
            return [];
        }
    }
}
exports.CourseSearch = CourseSearch;
//# sourceMappingURL=courses.search.js.map