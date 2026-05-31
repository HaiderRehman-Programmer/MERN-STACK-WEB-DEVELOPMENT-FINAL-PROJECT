// Global Express Request augmentation — adds `req.user` type
declare namespace Express {
  interface Request {
    user?: {
      id: string;
      role: string;
    };
  }
}
