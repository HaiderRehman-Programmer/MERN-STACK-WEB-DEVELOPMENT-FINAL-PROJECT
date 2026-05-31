export declare class CourseSearch {
    private static isOperational;
    static init(): Promise<void>;
    static indexCourse(course: any): Promise<void>;
    static removeCourse(courseId: string): Promise<void>;
    static searchCourses(query: string, category?: string): Promise<any[]>;
    private static fallbackSearch;
}
//# sourceMappingURL=courses.search.d.ts.map