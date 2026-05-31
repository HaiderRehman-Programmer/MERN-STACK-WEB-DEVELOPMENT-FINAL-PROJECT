"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validateRequest_1 = require("../../middleware/validateRequest");
const lessons_schema_1 = require("./lessons.schema");
const lessons_controller_1 = require("./lessons.controller");
const requireAuth_1 = require("../../middleware/requireAuth");
const restrictTo_1 = require("../../middleware/restrictTo");
const uploadEngine_1 = require("../../utils/uploadEngine");
const router = express_1.default.Router();
// Mixed Authorization Paths
router.get('/course/:courseId', lessons_controller_1.getCourseLessons); // Evaluates context dynamically inside controller
router.use(requireAuth_1.requireAuth);
// Student Mutation Bounday
router.post('/:id/complete', lessons_controller_1.toggleLessonCompletion);
router.patch('/:id/progress', lessons_controller_1.updateLessonProgress);
// Instructor Mutation Boundaries
router.use((0, restrictTo_1.restrictTo)('INSTRUCTOR', 'ADMIN'));
router.post('/', (0, validateRequest_1.validateRequest)(lessons_schema_1.createLessonSchema), lessons_controller_1.createLesson);
router.post('/upload', uploadEngine_1.uploadEngine.single('media'), lessons_controller_1.uploadMedia);
router.patch('/:id', lessons_controller_1.updateLesson);
router.delete('/:id', lessons_controller_1.deleteLesson);
exports.default = router;
//# sourceMappingURL=lessons.routes.js.map