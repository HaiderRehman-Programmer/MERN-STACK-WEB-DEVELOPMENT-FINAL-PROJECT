"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payments_controller_1 = require("./payments.controller");
const requireAuth_1 = require("../../middleware/requireAuth");
const restrictTo_1 = require("../../middleware/restrictTo");
const router = express_1.default.Router();
router.use(requireAuth_1.requireAuth);
router.post('/create-checkout', (0, restrictTo_1.restrictTo)('STUDENT'), payments_controller_1.createCheckoutSession);
router.get('/verify-session', payments_controller_1.verifySession);
exports.default = router;
//# sourceMappingURL=payments.routes.js.map