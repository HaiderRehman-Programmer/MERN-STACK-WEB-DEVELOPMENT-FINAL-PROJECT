"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const requireAuth_1 = require("../../middleware/requireAuth");
const discussions_controller_1 = require("./discussions.controller");
const router = express_1.default.Router();
router.use(requireAuth_1.requireAuth);
router.get('/lesson/:lessonId', discussions_controller_1.getLessonDiscussions);
router.post('/question', discussions_controller_1.createQuestion);
router.post('/reply', discussions_controller_1.replyToQuestion);
router.delete('/question/:id', discussions_controller_1.deleteQuestion);
router.delete('/reply/:id', discussions_controller_1.deleteReply);
exports.default = router;
//# sourceMappingURL=discussions.routes.js.map