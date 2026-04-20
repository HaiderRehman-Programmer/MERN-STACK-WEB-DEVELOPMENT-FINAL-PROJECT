import { ZodType } from 'zod';
import { Request, Response, NextFunction } from 'express';
export declare const validateRequest: (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=validateRequest.d.ts.map