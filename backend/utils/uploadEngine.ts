import multer from 'multer';
import { AppError } from './AppError';
import path from 'path';
import fs from 'fs';

// Ensure localized mapping boundary exists dynamically
const uploadPath = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, uniqueFileName);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowMimes = ['video/mp4', 'image/jpeg', 'image/png'];
  if (allowMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid File Format. Execution halted safely.', 400));
  }
};

export const uploadEngine = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB Absolute Cap Boundary
  }
});
