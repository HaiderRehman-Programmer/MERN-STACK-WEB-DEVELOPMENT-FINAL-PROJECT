"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validateRequest_1 = require("../../middleware/validateRequest");
const courses_schema_1 = require("./courses.schema");
const courses_controller_1 = require("./courses.controller");
const requireAuth_1 = require("../../middleware/requireAuth");
const restrictTo_1 = require("../../middleware/restrictTo");
const router = express_1.default.Router();
// Public Read Vectors
router.get('/', courses_controller_1.getAllCourses);
// Secured Creation & Management Vectors
router.use(requireAuth_1.requireAuth);
router.get('/mine', (0, restrictTo_1.restrictTo)('INSTRUCTOR', 'ADMIN'), courses_controller_1.getMyCourses);
router.get('/mine/analytics', (0, restrictTo_1.restrictTo)('INSTRUCTOR', 'ADMIN'), courses_controller_1.getMyAnalytics);
router.post('/', (0, restrictTo_1.restrictTo)('INSTRUCTOR', 'ADMIN'), (0, validateRequest_1.validateRequest)(courses_schema_1.createCourseSchema), courses_controller_1.createCourse);
router.patch('/:id', (0, restrictTo_1.restrictTo)('INSTRUCTOR', 'ADMIN'), courses_controller_1.updateCourse);
router.patch('/:id/publish', (0, restrictTo_1.restrictTo)('INSTRUCTOR', 'ADMIN'), courses_controller_1.togglePublish);
router.delete('/:id', (0, restrictTo_1.restrictTo)('INSTRUCTOR', 'ADMIN'), courses_controller_1.deleteCourse);
exports.default = router;
//# sourceMappingURL=courses.routes.js.map