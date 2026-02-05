import { Request, Response, NextFunction } from 'express';
import { ValidationChain } from 'express-validator';
export declare function validateRequest(validations: ValidationChain[]): (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=validate.middleware.d.ts.map