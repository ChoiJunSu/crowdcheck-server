import {
  AsyncRouter,
  Request,
  Response,
  NextFunction,
} from 'express-async-router';
import {
  IGetLoginRequest,
  IGetLoginResponse,
} from '@controllers/AuthController/type';
import AuthService from '@services/AuthService';
import { IRenewAuthTokenRequest } from '@services/AuthService/type';

const AuthController = AsyncRouter();

AuthController.get(
  '/oauthLogin',
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<IGetLoginResponse> => {
    const { provider, code, redirectUri } = req.query;
    return await AuthService.oauthLogin({
      provider,
      code,
      redirectUri,
    } as IGetLoginRequest);
  }
);

AuthController.get(
  '/renewAuthToken',
  async (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;
    return await AuthService.renewAuthToken({
      authorization,
    } as IRenewAuthTokenRequest);
  }
);

export default AuthController;
