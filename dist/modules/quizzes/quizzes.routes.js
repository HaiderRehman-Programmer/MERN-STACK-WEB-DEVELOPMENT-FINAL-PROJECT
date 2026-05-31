"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const requireAuth_1 = require("../../middleware/requireAuth");
const restrictTo_1 = require("../../middleware/restrictTo");
const quizzes_controller_1 = require("./quizzes.controller");
const router = express_1.default.Router();
router.use(requireAuth_1.requireAuth);
// Student access
router.get('/lesson/:lessonId', quizzes_controller_1.getQuizByLesson);
router.post('/:quizId/submit', quizzes_controller_1.submitQuiz);
// Instructor access
router.post('/', (0, restrictTo_1.restrictTo)('INSTRUCTOR', 'ADMIN'), quizzes_controller_1.createOrUpdateQuiz);
exports.default = router;
//# sourceMappingURL=quizzes.routes.js.map