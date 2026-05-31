"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validateRequest_1 = require("../../middleware/validateRequest");
const auth_schema_1 = require("./auth.schema");
const auth_controller_1 = require("./auth.controller");
const requireAuth_1 = require("../../middleware/requireAuth");
const restrictTo_1 = require("../../middleware/restrictTo");
const uploadEngine_1 = require("../../utils/uploadEngine");
const router = express_1.default.Router();
router.post('/register', (0, validateRequest_1.validateRequest)(auth_schema_1.registerSchema), auth_controller_1.register);
router.post('/login', (0, validateRequest_1.validateRequest)(auth_schema_1.loginSchema), auth_controller_1.login);
router.post('/refresh', auth_controller_1.refresh);
router.post('/forgot-password', (0, validateRequest_1.validateRequest)(auth_schema_1.forgotPasswordSchema), auth_controller_1.forgotPassword);
router.patch('/reset-password/:token', (0, validateRequest_1.validateRequest)(auth_schema_1.resetPasswordSchema), auth_controller_1.resetPassword);
router.get('/verify-email/:token', auth_controller_1.verifyEmail);
// Secure Routing Boundary
router.use(requireAuth_1.requireAuth);
router.post('/logout', auth_controller_1.logout);
router.patch('/me', (0, validateRequest_1.validateRequest)(auth_schema_1.updateProfileSchema), auth_controller_1.updateProfile);
router.patch('/change-password', (0, validateRequest_1.validateRequest)(auth_schema_1.changePasswordSchema), auth_controller_1.changePassword);
router.patch('/me/avatar', uploadEngine_1.uploadEngine.single('avatar'), auth_controller_1.updateAvatar);
router.get('/me', (0, restrictTo_1.restrictTo)('STUDENT', 'INSTRUCTOR', 'ADMIN'), auth_controller_1.getMe);
router.get('/me/enrollments', (0, restrictTo_1.restrictTo)('STUDENT', 'INSTRUCTOR', 'ADMIN'), auth_controller_1.getMyEnrollments);
router.get('/me/dashboard', (0, restrictTo_1.restrictTo)('STUDENT', 'INSTRUCTOR', 'ADMIN'), auth_controller_1.getDashboard);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map