"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validateRequest_1 = require("../../middleware/validateRequest");
const enrollments_schema_1 = require("./enrollments.schema");
const enrollments_controller_1 = require("./enrollments.controller");
const requireAuth_1 = require("../../middleware/requireAuth");
const restrictTo_1 = require("../../middleware/restrictTo");
const router = express_1.default.Router();
router.use(requireAuth_1.requireAuth);
router.post('/', (0, restrictTo_1.restrictTo)('STUDENT'), (0, validateRequest_1.validateRequest)(enrollments_schema_1.createEnrollmentSchema), enrollments_controller_1.enrollInCourse);
router.get('/:id/certificate', (0, restrictTo_1.restrictTo)('STUDENT'), enrollments_controller_1.generateCertificate);
exports.default = router;
//# sourceMappingURL=enrollments.routes.js.map