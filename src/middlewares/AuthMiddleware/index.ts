import { Request, Response, NextFunction } from 'express-async-router';
import { verify } from 'jsonwebtoken';
import { JWT_SECRET } from '@constants/jwt';
import { IAuthTokenPayload } from '@services/AuthService/type';

const AuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const response = {
    ok: false,
    error: 'Unauthorized',
  };
  const { authorization } = req.headers;
  if (!authorization) return res.status(401).send(response);
  const authToken = authorization.split(' ')[1];
  try {
    const { exp } = (await verify(authToken, JWT_SECRET)) as IAuthTokenPayload;
    if (!exp || Date.now() > exp * 1000) return res.status(401).send(response);
  } catch (e) {
    console.error(e);
    return res.status(401).send(response);
  }

  return next();
};

export default AuthMiddleware;
