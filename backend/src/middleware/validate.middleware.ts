import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

export function validateRequest(validations: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      next();
      return;
    }
    const firstError = errors.array()[0];
    const message = firstError && 'msg' in firstError ? String(firstError.msg) : '입력값을 확인해주세요.';
    res.status(400).json({ message });
  };
}
