"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.getCourseReviews = exports.createReview = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const reviews_service_1 = require("./reviews.service");
exports.createReview = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await reviews_service_1.ReviewService.createOrUpdate(req.body, req.user.id);
    res.status(result.updated ? 200 : 201).json({
        success: true,
        message: result.updated ? 'Review updated' : 'Review submitted',
        data: result.data || { id: result.id }
    });
});
exports.getCourseReviews = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const reviews = await reviews_service_1.ReviewService.getCourseReviews(req.params['courseId']);
    res.status(200).json({
        success: true,
        results: reviews.length,
        data: reviews,
    });
});
exports.deleteReview = (0, catchAsync_1.catchAsync)(async (req, res) => {
    await reviews_service_1.ReviewService.deleteReview(req.params['id'], req.user.id);
    res.status(200).json({
        success: true,
        message: 'Review deleted'
    });
});
//# sourceMappingURL=reviews.controller.js.map