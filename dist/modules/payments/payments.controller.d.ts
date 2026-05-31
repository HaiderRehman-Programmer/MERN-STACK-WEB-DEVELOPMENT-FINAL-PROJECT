import { Request, Response } from 'express';
export declare const createCheckoutSession: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const stripeWebhook: (req: Request, res: Response) => Promise<void>;
export declare const verifySession: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=payments.controller.d.ts.map