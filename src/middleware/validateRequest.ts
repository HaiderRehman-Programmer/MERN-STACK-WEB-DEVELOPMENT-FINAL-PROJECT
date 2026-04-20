import { z, ZodError, ZodType } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validateRequest = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));
        return res.status(422).json({
          success: false,
          status: 'fail',
          error: 'Validation Error',
          details,
        });
      }
      next(error);
    }
  };
};
