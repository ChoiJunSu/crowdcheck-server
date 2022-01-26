import { AsyncRouter } from 'express-async-router';
import AuthService from '@services/AuthService';
import {
  IAuthRegisterCorporateRequest,
  IAuthLoginOauthRequest,
  IAuthTokenRenewRequest,
  IAuthLoginRequest,
  IAuthRegisterPersonalRequest,
  IAuthLoginCandidateRequest,
  IAuthRegisterOauthRequest,
  IAuthPhoneSendRequest,
  IAuthPhoneVerifyRequest,
} from '@services/AuthService/type';
import AuthMiddleware from '@middlewares/AuthMiddleware';
import {
  INextFunction,
  IRequest,
  IResponse,
} from '@controllers/BaseController/type';
import { upload } from '@utils/multer';

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

AuthController.post(
  '/login/candidate',
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { name, phone, code } = req.body;

    return res.send(
      await AuthService.loginCandidate({
        name,
        phone,
        code,
      } as IAuthLoginCandidateRequest)
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
  upload.array('certificates'),
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { name, phone, email, password, careers } = req.body;
    console.log(req.file);
    console.log(req.files);

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
  '/register/oauth',
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { name, phone, careers, registerToken } = req.body;

    return res.send(
      await AuthService.registerOauth({
        name,
        phone,
        careers,
        registerToken,
      } as IAuthRegisterOauthRequest)
    );
  }
);

AuthController.post(
  '/register/corporate',
  upload.single('certificate'),
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

export default AuthController;
