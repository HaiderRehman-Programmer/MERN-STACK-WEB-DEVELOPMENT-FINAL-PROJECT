"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const requireAuth_1 = require("../../middleware/requireAuth");
const wishlist_controller_1 = require("./wishlist.controller");
const router = express_1.default.Router();
router.use(requireAuth_1.requireAuth);
router.get('/', wishlist_controller_1.getWishlist);
router.post('/:courseId', wishlist_controller_1.toggleWishlist);
exports.default = router;
//# sourceMappingURL=wishlist.routes.js.map