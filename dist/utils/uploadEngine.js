"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadEngine = void 0;
const multer_1 = __importDefault(require("multer"));
const AppError_1 = require("./AppError");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Ensure localized mapping boundary exists dynamically
const uploadPath = path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadPath)) {
    fs_1.default.mkdirSync(uploadPath, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
        cb(null, uniqueFileName);
    }
});
const fileFilter = (req, file, cb) => {
    const allowMimes = ['video/mp4', 'image/jpeg', 'image/png'];
    if (allowMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new AppError_1.AppError('Invalid File Format. Execution halted safely.', 400));
    }
};
exports.uploadEngine = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB Absolute Cap Boundary
    }
});
//# sourceMappingURL=uploadEngine.js.map