import {
  AsyncRouter,
  Request,
  Response,
  NextFunction,
} from 'express-async-router';
import {
  IGetOauthLoginRequest,
  IGetOauthLoginResponse,
} from '@controllers/AuthController/type';
import AuthService from '@services/AuthService';
import {
  IOauthLoginRequest,
  IRenewAuthTokenRequest,
} from '@services/AuthService/type';
import AuthMiddleware from '@middlewares/AuthMiddleware';

const AuthController = AsyncRouter();

AuthController.get(
  '/oauthLogin',
  async (req: Request, res: Response, next: NextFunction) => {
    const { provider, code, redirectUri } = req.query;
    return res.send(
      await AuthService.oauthLogin({
        provider,
        code,
        redirectUri,
      } as IOauthLoginRequest)
    );
  }
);

AuthController.get(
  '/renewAuthToken',
  AuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;
    return res.send(
      await AuthService.renewAuthToken({
        authorization,
      } as IRenewAuthTokenRequest)
    );
  }
);

export default AuthController;
