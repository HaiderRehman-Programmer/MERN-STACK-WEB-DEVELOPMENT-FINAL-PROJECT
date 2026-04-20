"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_controller_1 = require("./admin.controller");
const requireAuth_1 = require("../../middleware/requireAuth");
const restrictTo_1 = require("../../middleware/restrictTo");
const router = express_1.default.Router();
router.use(requireAuth_1.requireAuth);
router.use((0, restrictTo_1.restrictTo)('ADMIN'));
router.get('/stats', admin_controller_1.getAdminStats);
router.get('/health', admin_controller_1.getHealth);
router.get('/users', admin_controller_1.getAllUsers);
router.patch('/users/:id/role', admin_controller_1.updateUserRole);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map