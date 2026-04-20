import { meili } from '../../config/meilisearch';
import { logger } from '../../config/logger';

const COURSE_INDEX = 'courses';

export class CourseSearch {
  static async init() {
    try {
      const index = meili.index(COURSE_INDEX);
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
      logger.info('🔍 Meilisearch index settings updated');
    } catch (error) {
      logger.error({ error }, '❌ Failed to initialize Meilisearch index');
    }
  }

  static async indexCourse(course: any) {
    try {
      await meili.index(COURSE_INDEX).addDocuments([
        {
          id: course.id,
          title: course.title,
          description: course.description,
          category: course.category,
          isPublished: course.isPublished,
        },
      ]);
    } catch (error) {
      logger.error({ error, courseId: course.id }, '❌ Failed to index course in Meilisearch');
    }
  }

  static async removeCourse(courseId: string) {
    try {
      await meili.index(COURSE_INDEX).deleteDocument(courseId);
    } catch (error) {
      logger.error({ error, courseId }, '❌ Failed to remove course from Meilisearch');
    }
  }

  static async searchCourses(query: string, category?: string) {
    try {
      const filter = [];
      filter.push('isPublished = true');
      if (category && category !== 'All') {
        filter.push(`category = "${category}"`);
      }

      const results = await meili.index(COURSE_INDEX).search(query, {
        filter: filter.join(' AND '),
      });

      return results.hits.map((hit: any) => hit.id);
    } catch (error) {
      logger.error({ error, query }, '❌ Meilisearch search failed');
      return [];
    }
  }
}
