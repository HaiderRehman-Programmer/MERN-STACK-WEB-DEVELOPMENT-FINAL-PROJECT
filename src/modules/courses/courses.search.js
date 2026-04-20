"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseSearch = void 0;
const meilisearch_1 = require("../../config/meilisearch");
const logger_1 = require("../../config/logger");
const COURSE_INDEX = 'courses';
class CourseSearch {
    static async init() {
        try {
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
            logger_1.logger.info('🔍 Meilisearch index settings updated');
        }
        catch (error) {
            logger_1.logger.error({ error }, '❌ Failed to initialize Meilisearch index');
        }
    }
    static async indexCourse(course) {
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
        try {
            await meilisearch_1.meili.index(COURSE_INDEX).deleteDocument(courseId);
        }
        catch (error) {
            logger_1.logger.error({ error, courseId }, '❌ Failed to remove course from Meilisearch');
        }
    }
    static async searchCourses(query, category) {
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
            logger_1.logger.error({ error, query }, '❌ Meilisearch search failed');
            return [];
        }
    }
}
exports.CourseSearch = CourseSearch;
//# sourceMappingURL=courses.search.js.map