"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moderationStrike = exports.deleteReply = exports.deleteDiscussion = exports.getModerationContent = exports.toggleUserBan = exports.getHealth = exports.getAdminStats = exports.updateUserRole = exports.getAllUsers = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const admin_service_1 = require("./admin.service");
exports.getAllUsers = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const users = await admin_service_1.AdminService.getAllUsers();
    res.status(200).json({
        success: true,
        results: users.length,
        data: users,
    });
});
exports.updateUserRole = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params['id'];
    const { role } = req.body;
    const result = await admin_service_1.AdminService.updateUserRole(id, role);
    res.status(200).json({
        success: true,
        message: `User role updated to ${result.role}`,
    });
});
exports.getAdminStats = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const stats = await admin_service_1.AdminService.getGlobalStats();
    res.status(200).json({
        success: true,
        data: stats,
    });
});
exports.getHealth = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const health = await admin_service_1.AdminService.getSystemHealth();
    res.status(200).json({
        success: true,
        data: health,
    });
});
exports.toggleUserBan = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const { isBanned } = req.body;
    const result = await admin_service_1.AdminService.toggleUserBan(id, isBanned);
    res.status(200).json({ success: true, message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`, data: result });
});
exports.getModerationContent = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const data = await admin_service_1.AdminService.getContentForModeration();
    res.status(200).json({ success: true, data });
});
exports.deleteDiscussion = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    await admin_service_1.AdminService.deleteDiscussion(id);
    res.status(200).json({ success: true, message: 'Discussion thread deleted' });
});
exports.deleteReply = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    await admin_service_1.AdminService.deleteReply(id);
    res.status(200).json({ success: true, message: 'Reply deleted' });
});
exports.moderationStrike = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const result = await admin_service_1.AdminService.moderationStrike(id, reason || 'No reason provided');
    res.status(200).json(result);
});
//# sourceMappingURL=admin.controller.js.map