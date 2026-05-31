"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitQuiz = exports.getQuizByLesson = exports.createOrUpdateQuiz = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const quizzes_service_1 = require("./quizzes.service");
exports.createOrUpdateQuiz = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await quizzes_service_1.QuizService.createOrUpdate(req.body, req.user.id);
    res.status(201).json({
        success: true,
        message: 'Quiz created successfully',
        data: result
    });
});
exports.getQuizByLesson = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const lessonId = req.params['lessonId'];
    const result = await quizzes_service_1.QuizService.getByLesson(lessonId);
    res.status(200).json({
        success: true,
        data: result
    });
});
exports.submitQuiz = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const quizId = req.params['quizId'];
    const result = await quizzes_service_1.QuizService.submitAttempt(quizId, req.body.answers, req.user.id);
    res.status(200).json({
        success: true,
        data: result
    });
});
//# sourceMappingURL=quizzes.controller.js.map