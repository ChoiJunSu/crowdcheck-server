import { decode, sign } from 'jsonwebtoken';
import {
  IAuthTokenPayload,
  ICorporateLoginRequest,
  ICorporateLoginResponse,
  ICorporateRegisterRequest,
  ICorporateRegisterResponse,
  IOauthLoginRequest,
  IOauthLoginResponse,
  IRenewAuthTokenRequest,
  IRenewAuthTokenResponse,
} from '@services/AuthService/type';
import { JWT_EXPIRES_IN, JWT_ISSUER, JWT_SECRET } from '@constants/jwt';
import { URLSearchParams } from 'url';
import axios from 'axios';
import { compare, genSalt, hash } from 'bcrypt';
import UserModel from '@models/UserModel';
import CorporateModel from '@models/CorporateModel';

class AuthService {
  static oauthLogin = async ({
    provider,
    code,
    redirectUri,
  }: IOauthLoginRequest): Promise<IOauthLoginResponse> => {
    const response: IOauthLoginResponse = {
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
        where: {
          email,
          type: 'personal',
        },
      });
      if (!userFindOneResult) {
        response.error = '회원가입이 필요합니다.';
        return response;
      }
      const { id, name } = userFindOneResult;
      // sign authToken with email
      response.authToken = await sign(
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

  static renewAuthToken = async ({
    authorization,
  }: IRenewAuthTokenRequest): Promise<IRenewAuthTokenResponse> => {
    const response: IRenewAuthTokenResponse = {
      ok: false,
      error: '',
      authToken: '',
    };
    try {
      // extract and decode authToken from authorization header
      const authToken = authorization.split(' ')[1];
      const { email } = (await decode(authToken)) as IAuthTokenPayload;
      // sign authToken with email
      response.authToken = await sign({ email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        issuer: JWT_ISSUER,
      });
      response.ok = true;
    } catch (e) {
      response.error = '토큰 재발급에 실패했습니다.';
    }

    return response;
  };

  static login = async ({
    email,
    password,
    type,
  }: ICorporateLoginRequest): Promise<ICorporateLoginResponse> => {
    const response: ICorporateLoginResponse = {
      ok: false,
      error: '',
      authToken: '',
    };
    try {
      // find corporate by email
      const userFindOneResult = await UserModel.findOne({
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
      response.authToken = await sign(
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

  static corporateRegister = async ({
    name,
    phone,
    email,
    password,
  }: ICorporateRegisterRequest): Promise<ICorporateRegisterResponse> => {
    const response: ICorporateRegisterResponse = {
      ok: false,
      error: '',
    };
    // try {
    //   // hash password
    //   const salt = await genSalt(10);
    //   const hashed = await hash(password, salt);
    //   // create corporate
    //   const corporateCreateResult = CorporateModel.create({
    //     name,
    //     phone,
    //     email,
    //     hashed,
    //   });
    //   if (!corporateCreateResult) {
    //     response.error = '기업회원 생성 오류입니다.';
    //     return response;
    //   }
    //   response.ok = true;
    // } catch (e) {
    //   console.error(e);
    //   response.error = '기업회원 가입에 실패했습니다.';
    // }

    return response;
  };
}

export default AuthService;
