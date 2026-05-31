"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reviews_controller_1 = require("./reviews.controller");
const requireAuth_1 = require("../../middleware/requireAuth");
const router = express_1.default.Router();
// Public: read reviews
router.get('/course/:courseId', reviews_controller_1.getCourseReviews);
// Protected: write/delete reviews
router.use(requireAuth_1.requireAuth);
router.post('/', reviews_controller_1.createReview);
router.delete('/:id', reviews_controller_1.deleteReview);
exports.default = router;
//# sourceMappingURL=reviews.routes.js.map