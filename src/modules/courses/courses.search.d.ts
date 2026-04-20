export declare class CourseSearch {
    static init(): Promise<void>;
    static indexCourse(course: any): Promise<void>;
    static removeCourse(courseId: string): Promise<void>;
    static searchCourses(query: string, category?: string): Promise<any[]>;
}
//# sourceMappingURL=courses.search.d.ts.map