import {
  AsyncRouter,
  Request,
  Response,
  NextFunction,
} from 'express-async-router';
import AuthService from '@services/AuthService';
import {
  ICorporateLoginRequest,
  ICorporateRegisterRequest,
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

AuthController.post(
  '/login',
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, type } = req.body;

    return res.send(
      await AuthService.login({
        email,
        password,
        type,
      } as ICorporateLoginRequest)
    );
  }
);

AuthController.post(
  '/corporateRegister',
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, phone, email, password } = req.body;

    return res.send(
      await AuthService.corporateRegister({
        name,
        phone,
        email,
        password,
      } as ICorporateRegisterRequest)
    );
  }
);

export default AuthController;
