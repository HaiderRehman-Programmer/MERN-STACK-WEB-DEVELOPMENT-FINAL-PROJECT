import { meili } from '../../config/meilisearch';
import { logger } from '../../config/logger';
import { Course } from '../../models/Course';

const COURSE_INDEX = 'courses';

export class CourseSearch {
  private static isOperational = false;

  static async init() {
    try {
      // Test connectivity by getting index or checking health
      await meili.health();
      
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
      this.isOperational = true;
      logger.info('🔍 Meilisearch index settings updated and active');
    } catch (error) {
      this.isOperational = false;
      logger.warn('⚠️ Meilisearch unreachable. Falling back to MongoDB search.');
    }
  }

  static async indexCourse(course: any) {
    if (!this.isOperational) return;

    try {
      await meili.index(COURSE_INDEX).addDocuments([
        {
          id: course.id || course._id,
          title: course.title,
          description: course.description,
          category: course.category,
          isPublished: course.isPublished,
        },
      ]);
    } catch (error) {
      logger.error({ error, courseId: course.id || course._id }, '❌ Failed to index course in Meilisearch');
    }
  }

  static async removeCourse(courseId: string) {
    if (!this.isOperational) return;

    try {
      await meili.index(COURSE_INDEX).deleteDocument(courseId);
    } catch (error) {
      logger.error({ error, courseId }, '❌ Failed to remove course from Meilisearch');
    }
  }

  static async searchCourses(query: string, category?: string) {
    if (!this.isOperational) {
      return this.fallbackSearch(query, category);
    }

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
      logger.error({ error, query }, '❌ Meilisearch search failed. Attempting fallback.');
      return this.fallbackSearch(query, category);
    }
  }

  private static async fallbackSearch(query: string, category?: string) {
    try {
      const matchConditions: any = { isPublished: true };
      if (category && category !== 'All') {
        matchConditions.category = category;
      }
      matchConditions.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];

      const results = await Course.find(matchConditions).select('_id');
      return results.map(r => r._id);
    } catch (error) {
      logger.error({ error, query }, '❌ MongoDB fallback search failed');
      return [];
    }
  }
}
