"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWishlist = exports.toggleWishlist = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const wishlist_service_1 = require("./wishlist.service");
exports.toggleWishlist = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { courseId } = req.params;
    const result = await wishlist_service_1.WishlistService.toggleWishlist(req.user.id, courseId);
    res.status(200).json({
        success: true,
        message: result.favorited ? 'Added to wishlist' : 'Removed from wishlist',
        data: result
    });
});
exports.getWishlist = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const wishlist = await wishlist_service_1.WishlistService.getWishlist(req.user.id);
    res.status(200).json({
        success: true,
        data: wishlist
    });
});
//# sourceMappingURL=wishlist.controller.js.map