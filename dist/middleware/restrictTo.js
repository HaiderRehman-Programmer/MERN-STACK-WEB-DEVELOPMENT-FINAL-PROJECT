"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = void 0;
const AppError_1 = require("../utils/AppError");
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new AppError_1.AppError('You do not possess permission to perform this action.', 403));
        }
        next();
    };
};
exports.restrictTo = restrictTo;
//# sourceMappingURL=restrictTo.js.map