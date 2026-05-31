"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCourse = exports.updateCourse = exports.togglePublish = exports.getMyAnalytics = exports.getMyCourses = exports.getAllCourses = exports.createCourse = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const courses_service_1 = require("./courses.service");
exports.createCourse = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await courses_service_1.CourseService.createCourse(req.body, req.user.id);
    res.status(201).json({ success: true, data: result });
});
exports.getAllCourses = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await courses_service_1.CourseService.findCourses(req.query);
    res.status(200).json({ success: true, ...result });
});
exports.getMyCourses = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const courses = await courses_service_1.CourseService.findInstructorCourses(req.user.id);
    res.status(200).json({ success: true, results: courses.length, data: courses });
});
exports.getMyAnalytics = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await courses_service_1.CourseService.getInstructorAnalytics(req.user.id);
    res.status(200).json({ success: true, data: result });
});
exports.togglePublish = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params['id'];
    const result = await courses_service_1.CourseService.togglePublish(id, req.user.id);
    res.status(200).json({ success: true, data: result });
});
exports.updateCourse = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params['id'];
    const result = await courses_service_1.CourseService.updateCourse(id, req.body, req.user.id);
    res.status(200).json({ success: true, data: result });
});
exports.deleteCourse = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params['id'];
    await courses_service_1.CourseService.deleteCourse(id, req.user.id);
    res.status(200).json({ success: true, message: 'Course deleted successfully' });
});
//# sourceMappingURL=courses.controller.js.map