import { decode, sign } from 'jsonwebtoken';
import {
  IAuthTokenPayload,
  IGetEmailByOauthCodeRequest,
  IGetEmailByOauthCodeResponse,
  IOauthLoginRequest,
  IOauthLoginResponse,
  IRenewAuthTokenRequest,
  IRenewAuthTokenResponse,
} from '@services/AuthService/type';
import { JWT_EXPIRES_IN, JWT_ISSUER, JWT_SECRET } from '@constants/jwt';
import { URLSearchParams } from 'url';
import axios from 'axios';
import UserService from '@services/UserService';

class AuthService {
  static getEmailByOauthCode = async ({
    provider,
    code,
    redirectUri,
  }: IGetEmailByOauthCodeRequest): Promise<IGetEmailByOauthCodeResponse> => {
    const response: IGetEmailByOauthCodeResponse = {
      ok: false,
      error: '',
      email: '',
    };
    try {
      switch (provider) {
        case 'kakao': {
          const params = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: '752369a3217c1905b6ce8a71a15eaf8c',
            redirect_uri: redirectUri,
            code,
            client_secret: 'LMYsThJdZqYizOZTPrdTcCLr6UnIqUAT',
          });
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
            response.error = `Failed to get access token`;
            return response;
          }
          const {
            data: { kakao_account },
          } = await axios.get('https://kapi.kakao.com/v2/user/me', {
            headers: {
              Authorization: `Bearer ${access_token}`,
              'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            },
          });
          if (!kakao_account || !kakao_account.has_email) {
            response.error = `Failed to get email`;
            return response;
          }
          response.ok = true;
          response.email = kakao_account.email;
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
            response.error = `Failed to get access token`;
            return response;
          }
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
            response.error = `Failed to get email`;
            return response;
          }
          response.ok = true;
          response.email = data.email;
          break;
        }

        default: {
          break;
        }
      }
    } catch (e) {
      console.error(e);
      response.error = 'Internal error';
    }

    return response;
  };

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
    const getEmailByOauthCodeResponse = await AuthService.getEmailByOauthCode({
      provider,
      code,
      redirectUri,
    });
    if (!getEmailByOauthCodeResponse.ok) {
      response.error = getEmailByOauthCodeResponse.error;
      return response;
    }
    const getUserByEmailResponse = await UserService.getUserByEmail({
      email: getEmailByOauthCodeResponse.email,
    });
    if (!getUserByEmailResponse.ok) {
      if (getUserByEmailResponse.error === 'User not found') {
        const createUserResponse = await UserService.createUser({
          email: getEmailByOauthCodeResponse.email,
        });
        if (!createUserResponse.ok) {
          response.error = createUserResponse.error;
          return response;
        }
      } else {
        response.error = getUserByEmailResponse.error;
        return response;
      }
    }
    try {
      response.authToken = await sign(
        { email: getEmailByOauthCodeResponse.email },
        JWT_SECRET,
        {
          expiresIn: JWT_EXPIRES_IN,
          issuer: JWT_ISSUER,
        }
      );
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = 'Oauth login failed';
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
      const authToken = authorization.split(' ')[1];
      const { email } = (await decode(authToken)) as IAuthTokenPayload;
      response.authToken = await sign({ email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        issuer: JWT_ISSUER,
      });
      response.ok = true;
    } catch (e) {
      response.error = 'Renew authToken failed';
    }

    return response;
  };
}

export default AuthService;
