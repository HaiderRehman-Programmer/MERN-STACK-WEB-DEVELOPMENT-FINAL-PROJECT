"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLessonDiscussions = exports.replyToQuestion = exports.createQuestion = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const AppError_1 = require("../../utils/AppError");
const discussions_service_1 = require("./discussions.service");
exports.createQuestion = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { lessonId, content } = req.body;
    if (!content)
        throw new AppError_1.AppError('Content is required', 400);
    const result = await discussions_service_1.DiscussionService.createQuestion(lessonId, req.user.id, content);
    res.status(201).json({
        success: true,
        message: 'Question posted successfully',
        data: result
    });
});
exports.replyToQuestion = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { discussionId, content } = req.body;
    if (!content)
        throw new AppError_1.AppError('Content is required', 400);
    const result = await discussions_service_1.DiscussionService.createReply(discussionId, req.user.id, content);
    res.status(201).json({
        success: true,
        message: 'Reply posted successfully',
        data: result
    });
});
exports.getLessonDiscussions = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const lessonId = req.params['lessonId'];
    const discussions = await discussions_service_1.DiscussionService.getByLesson(lessonId);
    res.status(200).json({
        success: true,
        data: discussions
    });
});
//# sourceMappingURL=discussions.controller.js.map