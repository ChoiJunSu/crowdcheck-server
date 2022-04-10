import { AsyncRouter } from 'express-async-router';
import AuthService from '@services/AuthService';
import {
  IAuthRegisterCorporateRequest,
  IAuthLoginOauthRequest,
  IAuthTokenRenewRequest,
  IAuthLoginRequest,
  IAuthRegisterPersonalRequest,
  IAuthRegisterOauthPersonalRequest,
  IAuthPhoneSendRequest,
  IAuthPhoneVerifyRequest,
  IAuthEmailSendRequest,
  IAuthPasswordResetRequest,
} from '@services/AuthService/type';
import AuthMiddleware from '@middlewares/AuthMiddleware';
import {
  INextFunction,
  IRequest,
  IResponse,
} from '@controllers/BaseController/type';
import { MulterMiddleware } from '@middlewares/MultureMiddleware';

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
    const { provider, code, redirectUri, type } = req.query;

    return res.send(
      await AuthService.loginOauth({
        provider,
        code,
        redirectUri,
        type,
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
  MulterMiddleware.upload.array('certificates'),
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { name, phone, email, password, careers } = req.body;

    return res.send(
      await AuthService.registerPersonal({
        name,
        phone,
        email,
        password,
        careers,
      } as IAuthRegisterPersonalRequest)
    );
  }
);

AuthController.post(
  '/register/oauth/personal',
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { name, phone, careers, registerToken } = req.body;

    return res.send(
      await AuthService.registerOauthPersonal({
        name,
        phone,
        careers,
        registerToken,
      } as IAuthRegisterOauthPersonalRequest)
    );
  }
);

AuthController.post(
  '/register/corporate',
  MulterMiddleware.upload.single('certificate'),
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { name, phone, email, password } = req.body;
    if (!req.file)
      return res.send({ ok: false, error: '사업자등록증을 업로드해주세요.' });

    return res.send(
      await AuthService.registerCorporate({
        name,
        certificate: req.file,
        phone,
        email,
        password,
      } as IAuthRegisterCorporateRequest)
    );
  }
);

AuthController.post(
  '/phone/send',
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { phone } = req.body;

    return res.send(
      await AuthService.phoneSend({ phone } as IAuthPhoneSendRequest)
    );
  }
);

AuthController.post(
  '/phone/verify',
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { phone, code } = req.body;

    return res.send(
      await AuthService.phoneVerify({
        phone,
        code: parseInt(code),
      } as IAuthPhoneVerifyRequest)
    );
  }
);

AuthController.post(
  '/email/send',
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { email } = req.body;

    return res.send(
      await AuthService.emailSend({
        email,
      } as IAuthEmailSendRequest)
    );
  }
);

AuthController.post(
  '/password/reset',
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { resetToken, password } = req.body;

    return res.send(
      await AuthService.passwordReset({
        resetToken,
        password,
      } as IAuthPasswordResetRequest)
    );
  }
);

export default AuthController;
