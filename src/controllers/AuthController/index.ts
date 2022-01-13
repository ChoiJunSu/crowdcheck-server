import { AsyncRouter } from 'express-async-router';
import AuthService from '@services/AuthService';
import {
  IAuthRegisterCorporateRequest,
  IAuthLoginOauthRequest,
  IAuthTokenRenewRequest,
  IAuthLoginRequest,
  IAuthRegisterPersonalRequest,
} from '@services/AuthService/type';
import AuthMiddleware from '@middlewares/AuthMiddleware';
import {
  INextFunction,
  IRequest,
  IResponse,
} from '@controllers/BaseController/type';

const AuthController = AsyncRouter();

AuthController.post(
  '/login',
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { email, password, type } = req.body;

    return res.send(
      await AuthService.login({
        email,
        password,
        type,
      } as IAuthLoginRequest)
    );
  }
);

AuthController.get(
  '/login/oauth',
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { provider, code, redirectUri } = req.query;

    return res.send(
      await AuthService.loginOauth({
        provider,
        code,
        redirectUri,
      } as IAuthLoginOauthRequest)
    );
  }
);

AuthController.get(
  '/token/renew',
  AuthMiddleware.isLoggedIn,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { authorization } = req.headers;

    return res.send(
      await AuthService.tokenRenew({
        authorization,
      } as IAuthTokenRenewRequest)
    );
  }
);

AuthController.post(
  '/register/personal',
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { name, phone, email, password, career } = req.body;

    return res.send(
      await AuthService.registerPersonal({
        name,
        phone,
        email,
        password,
        career,
      } as IAuthRegisterPersonalRequest)
    );
  }
);

AuthController.post(
  '/register/corporate',
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { name, phone, email, password } = req.body;

    return res.send(
      await AuthService.registerCorporate({
        name,
        phone,
        email,
        password,
      } as IAuthRegisterCorporateRequest)
    );
  }
);

export default AuthController;
