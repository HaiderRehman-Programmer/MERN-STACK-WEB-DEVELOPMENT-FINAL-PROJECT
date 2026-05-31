"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySession = exports.stripeWebhook = exports.createCheckoutSession = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const AppError_1 = require("../../utils/AppError");
const payments_service_1 = require("./payments.service");
exports.createCheckoutSession = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await payments_service_1.PaymentService.createCheckout(req.body.courseId, req.user.id);
    res.status(200).json({ success: true, data: result });
});
const stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    try {
        const result = await payments_service_1.PaymentService.handleWebhook(req.body, sig);
        res.status(200).json(result);
    }
    catch (err) {
        console.error('⚠️ Webhook Error:', err.message);
        res.status(400).send(err.message);
    }
};
exports.stripeWebhook = stripeWebhook;
exports.verifySession = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const sessionId = req.query.session_id;
    if (!sessionId)
        throw new AppError_1.AppError('Session ID is required', 400);
    const result = await payments_service_1.PaymentService.verifySession(sessionId);
    res.status(200).json({ success: true, data: result });
});
//# sourceMappingURL=payments.controller.js.map