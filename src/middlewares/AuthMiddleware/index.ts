import { IAuthTokenPayload } from '@services/AuthService/type';
import {
  INextFunction,
  IRequest,
  IResponse,
} from '@controllers/BaseController/type';
import { JwtSingleton } from '@utils/jwt';
import { IUserGetCorporateResponse } from '@services/UserService/type';
import UserModel from '@models/UserModel';

class AuthMiddleware {
  static isLoggedIn = async (
    req: IRequest,
    res: IResponse,
    next: INextFunction
  ) => {
    const response = {
      ok: false,
      error: '로그인이 필요합니다.',
    };
    const { authorization } = req.headers;
    if (!authorization) return res.status(401).send(response);
    const authToken = authorization.split(' ')[1];
    try {
      const { name, id, type, exp } = JwtSingleton.verify(
        authToken
      ) as IAuthTokenPayload;
      if (!exp || Date.now() > exp * 1000)
        return res.status(401).send(response);
      req.user = { name, id, type };
    } catch (e) {
      console.error(e);
      return res.status(401).send(response);
    }

    return next();
  };

  static isPersonal = async (
    req: IRequest,
    res: IResponse,
    next: INextFunction
  ) => {
    const response = {
      ok: false,
      error: '지원자 인증이 필요합니다.',
    };
    const { authorization } = req.headers;
    if (!authorization) return res.status(401).send(response);
    const authToken = authorization.split(' ')[1];
    try {
      const { name, id, type, exp } = JwtSingleton.verify(
        authToken
      ) as IAuthTokenPayload;
      if (!exp || Date.now() > exp * 1000)
        return res.status(401).send(response);
      if (type !== 'personal') {
        response.error = '잘못된 접근입니다.';
        return res.status(403).send(response);
      }
      req.user = { name, id, type };
    } catch (e) {
      console.error(e);
      return res.status(401).send(response);
    }

    return next();
  };

  static isCorporate = async (
    req: IRequest,
    res: IResponse,
    next: INextFunction
  ) => {
    const response = {
      ok: false,
      error: '로그인이 필요합니다.',
    };
    const { authorization } = req.headers;
    if (!authorization) return res.status(401).send(response);
    const authToken = authorization.split(' ')[1];
    try {
      const { name, id, type, exp } = JwtSingleton.verify(
        authToken
      ) as IAuthTokenPayload;
      if (!exp || Date.now() > exp * 1000)
        return res.status(401).send(response);
      if (type !== 'corporate') {
        response.error = '잘못된 접근입니다.';
        return res.status(403).send(response);
      }
      req.user = { name, id, type };
    } catch (e) {
      console.error(e);
      return res.status(401).send(response);
    }

    return next();
  };

  static isExpert = async (
    req: IRequest,
    res: IResponse,
    next: INextFunction
  ) => {
    const response = {
      ok: false,
      error: '로그인이 필요합니다.',
    };
    const { authorization } = req.headers;
    if (!authorization) return res.status(401).send(response);
    const authToken = authorization.split(' ')[1];
    try {
      const { name, id, type, exp } = JwtSingleton.verify(
        authToken
      ) as IAuthTokenPayload;
      if (!exp || Date.now() > exp * 1000)
        return res.status(401).send(response);
      if (type !== 'expert') {
        response.error = '잘못된 접근입니다.';
        return res.status(403).send(response);
      }
      req.user = { name, id, type };
    } catch (e) {
      console.error(e);
      return res.status(401).send(response);
    }

    return next();
  };

  static isCandidate = async (
    req: IRequest,
    res: IResponse,
    next: INextFunction
  ) => {
    const response = {
      ok: false,
      error: '지원자 인증이 필요합니다.',
    };
    const { authorization } = req.headers;
    if (!authorization) return res.status(401).send(response);
    const authToken = authorization.split(' ')[1];
    try {
      const { name, id, type, exp } = JwtSingleton.verify(
        authToken
      ) as IAuthTokenPayload;
      if (!exp || Date.now() > exp * 1000)
        return res.status(401).send(response);
      if (type !== 'candidate') {
        response.error = '잘못된 접근입니다.';
        return res.status(403).send(response);
      }
      req.user = { name, id, type };
    } catch (e) {
      console.error(e);
      return res.status(401).send(response);
    }

    return next();
  };
}

export default AuthMiddleware;
