import {
  AsyncRouter,
  Request,
  Response,
  NextFunction,
} from 'express-async-router';
import AuthService from '@services/AuthService';
import {
  IRegisterCorporateRequest,
  ILoginOauthRequest,
  ITokenRenewRequest,
  ILoginRequest,
  IRegisterPersonalRequest,
} from '@services/AuthService/type';
import AuthMiddleware from '@middlewares/AuthMiddleware';

const AuthController = AsyncRouter();

AuthController.post(
  '/login',
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, type } = req.body;

    return res.send(
      await AuthService.login({
        email,
        password,
        type,
      } as ILoginRequest)
    );
  }
);

AuthController.get(
  '/login/oauth',
  async (req: Request, res: Response, next: NextFunction) => {
    const { provider, code, redirectUri } = req.query;

    return res.send(
      await AuthService.loginOauth({
        provider,
        code,
        redirectUri,
      } as ILoginOauthRequest)
    );
  }
);

AuthController.get(
  '/token/renew',
  AuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;

    return res.send(
      await AuthService.tokenRenew({
        authorization,
      } as ITokenRenewRequest)
    );
  }
);

AuthController.post(
  '/register/personal',
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, phone, email, password, career } = req.body;

    return res.send(
      await AuthService.registerPersonal({
        name,
        phone,
        email,
        password,
        career,
      } as IRegisterPersonalRequest)
    );
  }
);

AuthController.post(
  '/register/corporate',
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, phone, email, password } = req.body;

    return res.send(
      await AuthService.registerCorporate({
        name,
        phone,
        email,
        password,
      } as IRegisterCorporateRequest)
    );
  }
);

export default AuthController;
