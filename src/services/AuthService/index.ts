import { decode, sign } from 'jsonwebtoken';
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
      });
      if (!userFindOneResult) {
        response.error = '해당 이메일로 등록된 회원이 없습니다.';
        return response;
      }
      const { id, name, hashed } = userFindOneResult;
      if (!hashed) {
        response.error = '다른 방식으로 로그인 해주세요.';
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
    };
    let email;
    try {
      // get email by oauth code
      switch (provider) {
        case 'kakao': {
          const params = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: '752369a3217c1905b6ce8a71a15eaf8c',
            redirect_uri: redirectUri,
            code,
            client_secret: 'LMYsThJdZqYizOZTPrdTcCLr6UnIqUAT',
          });
          // get access token by oauth code
          const {
            data: { access_token },
          } = await axios.post(
            'https://kauth.kakao.com/oauth/token',
            params.toString(),
            {
              headers: {
                'Content-Type':
                  'application/x-www-form-urlencoded;charset=utf-8',
              },
            }
          );
          if (!access_token) {
            response.error = `카카오로부터 정보를 불러오지 못했습니다.`;
            return response;
          }
          // get kakao account by oauth access token
          const {
            data: { kakao_account },
          } = await axios.get('https://kapi.kakao.com/v2/user/me', {
            headers: {
              Authorization: `Bearer ${access_token}`,
              'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            },
          });
          if (!kakao_account || !kakao_account.has_email) {
            response.error = `카카오로부터 정보를 불러오지 못했습니다.`;
            return response;
          }
          email = kakao_account.email;
          break;
        }

        case 'google': {
          const params = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id:
              '646489201957-l6859a2jp95c6fles5lcos3tmnlm8eab.apps.googleusercontent.com',
            redirect_uri: redirectUri,
            code,
            client_secret: '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',
          });
          // get access token by oauth code
          const {
            data: { access_token },
          } = await axios.post(
            'https://oauth2.googleapis.com/token',
            params.toString(),
            {
              headers: {
                'Content-Type':
                  'application/x-www-form-urlencoded;charset=utf-8',
              },
            }
          );
          if (!access_token) {
            response.error = `구글로부터 정보를 불러오지 못했습니다.`;
            return response;
          }
          // get google data by oauth access token
          const { data } = await axios.get(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
                'Content-Type':
                  'application/x-www-form-urlencoded;charset=utf-8',
              },
            }
          );
          if (!data) {
            response.error = `구글로부터 정보를 불러오지 못했습니다.`;
            return response;
          }
          email = data.email;
          break;
        }

        default: {
          break;
        }
      }
      // find user by email
      const userFindOneResult = await UserModel.findOne({
        attributes: ['id', 'name'],
        where: {
          email,
          type: 'personal',
        },
      });
      if (!userFindOneResult) {
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

  static registerCorporate = async ({
    name,
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
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '기업회원 가입에 실패했습니다.';
    }

    return response;
  };
}

export default AuthService;
