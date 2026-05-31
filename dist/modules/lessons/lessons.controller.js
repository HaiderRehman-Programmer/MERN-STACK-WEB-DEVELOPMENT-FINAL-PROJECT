"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLessonProgress = exports.toggleLessonCompletion = exports.updateLesson = exports.deleteLesson = exports.getCourseLessons = exports.createLesson = exports.uploadMedia = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const AppError_1 = require("../../utils/AppError");
const lessons_service_1 = require("./lessons.service");
exports.uploadMedia = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (!req.file) {
        throw new AppError_1.AppError("No file payload was transmitted", 400);
    }
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.status(200).json({
        success: true,
        data: { url: fileUrl }
    });
});
exports.createLesson = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await lessons_service_1.LessonService.createLesson(req.body, req.user.id);
    res.status(201).json({ success: true, data: result });
});
exports.getCourseLessons = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const courseId = req.params['courseId'];
    if (!courseId)
        throw new AppError_1.AppError('Course ID is required', 400);
    const finalLessons = await lessons_service_1.LessonService.getCourseLessons(courseId, req.user?.id);
    res.status(200).json({
        success: true,
        data: finalLessons
    });
});
exports.deleteLesson = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params['id'];
    await lessons_service_1.LessonService.deleteLesson(id, req.user.id);
    res.status(200).json({
        success: true,
        message: 'Lesson deleted successfully'
    });
});
exports.updateLesson = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params['id'];
    const updated = await lessons_service_1.LessonService.updateLesson(id, req.body, req.user.id);
    res.status(200).json({
        success: true,
        data: updated
    });
});
exports.toggleLessonCompletion = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params['id'];
    const isCompleted = await lessons_service_1.LessonService.toggleCompletion(id, req.user.id);
    res.status(200).json({
        success: true,
        message: `Lesson marked as ${isCompleted ? 'completed' : 'incomplete'}`,
        isCompleted
    });
});
exports.updateLessonProgress = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params['id'];
    const { seconds } = req.body;
    if (typeof seconds !== 'number')
        throw new AppError_1.AppError('Seconds must be a number', 400);
    await lessons_service_1.LessonService.updateProgress(id, req.user.id, seconds);
    res.status(200).json({
        success: true,
        message: 'Progress updated',
        data: { lastWatchedSeconds: seconds }
    });
});
//# sourceMappingURL=lessons.controller.js.map