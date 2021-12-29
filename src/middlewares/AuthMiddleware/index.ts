import { Request, Response, NextFunction } from 'express-async-router';

const AuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // req url 기반으로 public 제외하고 헤더 검증
  const { Authorization } = req.headers;
  // exp 검증
  // decode 검증
  return next();
};

export default AuthMiddleware;
