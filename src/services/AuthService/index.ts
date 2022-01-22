import { decode, sign, verify } from 'jsonwebtoken';
import {
  IAuthTokenPayload,
  IAuthRegisterCorporateRequest,
  IAuthRegisterCorporateResponse,
  IAuthLoginOauthRequest,
  IAuthLoginOauthResponse,
  IAuthTokenRenewRequest,
  IAuthTokenRenewResponse,
  IAuthLoginRequest,
  IAuthLoginResponse,
  IAuthRegisterPersonalRequest,
  IAuthRegisterPersonalResponse,
  IAuthLoginCandidateRequest,
  IAuthLoginCandidateResponse,
  IAuthRegisterOauthRequest,
  IAuthRegisterOauthResponse,
  IRegisterTokenPayload,
} from '@services/AuthService/type';
import { JWT_EXPIRES_IN, JWT_ISSUER, JWT_SECRET } from '@constants/jwt';
import { URLSearchParams } from 'url';
import axios from 'axios';
import { compare, genSalt, hash } from 'bcrypt';
import UserModel from '@models/UserModel';
import CorporateModel from '@models/CorporateModel';
import CareerModel from '@models/CareerModel';
import CandidateModel from '@models/CandidateModel';
import { MAX_TIMESTAMP } from '@constants/date';
import CorporateVerifyModel from '@models/CorporateVerifyModel';
import OauthService from '@services/OauthService';

class AuthService {
  static login = async ({
    email,
    password,
    type,
  }: IAuthLoginRequest): Promise<IAuthLoginResponse> => {
    const response: IAuthLoginResponse = {
      ok: false,
      error: '',
      authToken: '',
    };
    try {
      // find corporate by email
      const userFindOneResult = await UserModel.findOne({
        attributes: ['id', 'name', 'hashed'],
        where: {
          email,
          type,
        },
        include: {
          model: CorporateVerifyModel,
          attributes: ['verifiedAt'],
        },
      });
      if (!userFindOneResult) {
        response.error = '해당 이메일로 등록된 회원이 없습니다.';
        return response;
      }
      const { id, name, hashed, CorporateVerify } = userFindOneResult;
      if (!hashed) {
        response.error = '다른 방식으로 로그인 해주세요.';
        return response;
      } else if (
        type === 'corporate' &&
        (!CorporateVerify || !CorporateVerify.verifiedAt)
      ) {
        response.error = '사업자등록증 확인 중입니다. 조금만 기다려주세요.';
        return response;
      }
      // compare password with hashed
      const compareResult = await compare(password, hashed);
      if (!compareResult) {
        response.error = '비밀번호가 다릅니다.';
        return response;
      }
      // sign authToken with name, email
      response.authToken = sign(
        { id, name, type } as IAuthTokenPayload,
        JWT_SECRET,
        {
          expiresIn: JWT_EXPIRES_IN,
          issuer: JWT_ISSUER,
        }
      );
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '로그인에 실패했습니다.';
    }

    return response;
  };

  static loginOauth = async ({
    provider,
    code,
    redirectUri,
  }: IAuthLoginOauthRequest): Promise<IAuthLoginOauthResponse> => {
    const response: IAuthLoginOauthResponse = {
      ok: false,
      error: '',
      authToken: '',
      registerToken: '',
    };

    try {
      // get email by oauth code
      const getEmailByOauthCodeResponse =
        await OauthService.getEmailByOauthCode({ provider, code, redirectUri });
      if (!getEmailByOauthCodeResponse.ok) {
        response.error = getEmailByOauthCodeResponse.error;
        return response;
      }
      // find user by email
      const userFindOneResult = await UserModel.findOne({
        attributes: ['id', 'name', 'oauthProvider'],
        where: {
          email: getEmailByOauthCodeResponse.email,
          type: 'personal',
        },
      });
      if (!userFindOneResult) {
        response.registerToken = sign(
          {
            provider,
            email: getEmailByOauthCodeResponse.email,
          } as IRegisterTokenPayload,
          JWT_SECRET,
          { issuer: JWT_ISSUER, expiresIn: JWT_EXPIRES_IN }
        );
        response.error = '회원가입이 필요합니다.';
        return response;
      }
      const { id, name, oauthProvider } = userFindOneResult;
      // if oauth provider not matched
      if (oauthProvider !== provider) {
        response.error = '다른 방식으로 로그인 해주세요.';
        return response;
      }
      // sign authToken with email
      response.authToken = sign(
        { id, name, type: 'personal' } as IAuthTokenPayload,
        JWT_SECRET,
        {
          expiresIn: JWT_EXPIRES_IN,
          issuer: JWT_ISSUER,
        }
      );
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = 'Oauth 로그인에 실패했습니다.';
    }

    return response;
  };

  static loginCandidate = async ({
    name,
    phone,
    code,
  }: IAuthLoginCandidateRequest): Promise<IAuthLoginCandidateResponse> => {
    const response: IAuthLoginCandidateResponse = {
      ok: false,
      error: '',
      authToken: '',
    };

    try {
      // find candidate
      const candidateFindOneResult = await CandidateModel.findOne({
        attributes: ['id', 'requestId'],
        where: {
          name,
          phone,
          code,
        },
      });
      if (!candidateFindOneResult) {
        response.error = '지원자를 찾을 수 없습니다.';
        return response;
      }
      // sign authToken with email
      response.authToken = sign(
        {
          id: candidateFindOneResult.id,
          name,
          type: 'candidate',
        } as IAuthTokenPayload,
        JWT_SECRET,
        {
          expiresIn: JWT_EXPIRES_IN,
          issuer: JWT_ISSUER,
        }
      );
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '지원자 인증에 실패했습니다.';
    }

    return response;
  };

  static tokenRenew = async ({
    authorization,
  }: IAuthTokenRenewRequest): Promise<IAuthTokenRenewResponse> => {
    const response: IAuthTokenRenewResponse = {
      ok: false,
      error: '',
      authToken: '',
    };
    try {
      // extract and decode authToken from authorization header
      const authToken = authorization.split(' ')[1];
      const { id, name, type } = (await decode(authToken)) as IAuthTokenPayload;
      // sign authToken with email
      response.authToken = sign(
        { id, name, type } as IAuthTokenPayload,
        JWT_SECRET,
        {
          expiresIn: JWT_EXPIRES_IN,
          issuer: JWT_ISSUER,
        }
      );
      response.ok = true;
    } catch (e) {
      response.error = '토큰 재발급에 실패했습니다.';
    }

    return response;
  };

  static registerPersonal = async ({
    name,
    phone,
    email,
    password,
    careers,
  }: IAuthRegisterPersonalRequest): Promise<IAuthRegisterPersonalResponse> => {
    const response: IAuthRegisterPersonalResponse = {
      ok: false,
      error: '',
    };

    try {
      // hash password
      const salt = await genSalt(10);
      const hashed = await hash(password, salt);
      // create user
      const userCreateResult = await UserModel.create({
        name,
        phone,
        email,
        hashed,
        type: 'personal',
      });
      if (!userCreateResult) {
        response.error = '회원 생성 오류입니다.';
        return response;
      }
      // create career
      for (const { corporateName, department, startAt, endAt } of careers) {
        // find or create corporate
        const corporateFindOrCreateResult = await CorporateModel.findOrCreate({
          where: {
            name: corporateName,
          },
          defaults: {
            name: corporateName,
          },
        });
        if (!corporateFindOrCreateResult) {
          response.error = '경력 오류입니다.';
          return response;
        }
        // create career
        const careerCreateResult = await CareerModel.create({
          userId: userCreateResult.id,
          corporateId: corporateFindOrCreateResult[0].id,
          department,
          startAt,
          endAt: endAt || new Date(MAX_TIMESTAMP),
        });
        if (!careerCreateResult) {
          response.error = '경력 생성 오류입니다.';
          return response;
        }
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '개인회원 가입에 실패했습니다.';
    }

    return response;
  };

  static registerOauth = async ({
    name,
    phone,
    careers,
    registerToken,
  }: IAuthRegisterOauthRequest): Promise<IAuthRegisterOauthResponse> => {
    const response: IAuthRegisterOauthResponse = {
      ok: false,
      error: '',
    };

    try {
      // verify registerToken
      const { provider, email } = (await verify(
        registerToken,
        JWT_SECRET
      )) as IRegisterTokenPayload;
      // create user
      const userCreateResult = await UserModel.create({
        name,
        phone,
        email,
        type: 'personal',
        oauthProvider: provider,
      });
      if (!userCreateResult) {
        response.error = '회원 생성 오류입니다.';
        return response;
      }
      // create career
      for (const { corporateName, department, startAt, endAt } of careers) {
        // find or create corporate
        const corporateFindOrCreateResult = await CorporateModel.findOrCreate({
          where: {
            name: corporateName,
          },
          defaults: {
            name: corporateName,
          },
        });
        if (!corporateFindOrCreateResult) {
          response.error = '경력 오류입니다.';
          return response;
        }
        // create career
        const careerCreateResult = await CareerModel.create({
          userId: userCreateResult.id,
          corporateId: corporateFindOrCreateResult[0].id,
          department,
          startAt,
          endAt: endAt || new Date(MAX_TIMESTAMP),
        });
        if (!careerCreateResult) {
          response.error = '경력 생성 오류입니다.';
          return response;
        }
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = 'Oauth 회원가입에 실패했습니다.';
    }

    return response;
  };

  static registerCorporate = async ({
    name,
    registration,
    phone,
    email,
    password,
  }: IAuthRegisterCorporateRequest): Promise<IAuthRegisterCorporateResponse> => {
    const response: IAuthRegisterCorporateResponse = {
      ok: false,
      error: '',
    };

    try {
      // hash password
      const salt = await genSalt(10);
      const hashed = await hash(password, salt);
      // find or create corporate
      const corporateFindOrCreateResult = await CorporateModel.findOrCreate({
        where: { name },
        defaults: { name },
      });
      if (!corporateFindOrCreateResult) {
        response.error = '기업 생성 오류입니다.';
        return response;
      }
      // create user
      const userCreateResult = await UserModel.create({
        name,
        phone,
        email,
        hashed,
        type: 'corporate',
        corporateId: corporateFindOrCreateResult[0].id,
      });
      if (!userCreateResult) {
        response.error = '회원 생성 오류입니다.';
        return response;
      }
      // create corporateVerify
      const corporateVerifyCreateResult = await CorporateVerifyModel.create({
        userId: userCreateResult.id,
        registrationBucket: registration.bucket,
        registrationKey: registration.key,
      });
      if (!corporateVerifyCreateResult) {
        response.error = '인증 생성 오류입니다.';
        return response;
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '기업회원 가입에 실패했습니다.';
    }

    return response;
  };
}

export default AuthService;
