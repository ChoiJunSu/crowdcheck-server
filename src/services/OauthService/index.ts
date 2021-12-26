import axios from 'axios';
import { URLSearchParams } from 'url';
import UserService from '@services/UserService';
import {
  IGetEmailByOauthCodeRequest,
  IGetEmailByOauthCodeResponse,
  IOauthLoginRequest,
  IOauthLoginResponse,
} from '@services/OauthService/type';
import JwtService from '@services/JwtService';

class OauthService {
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

        case 'naver': {
          break;
        }

        default: {
          break;
        }
      }
    } catch (error) {
      console.error(error);
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
      email: '',
    };
    const getEmailByOauthCodeResponse = await OauthService.getEmailByOauthCode({
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
    const generateTokenResponse = JwtService.generateToken({
      email: getEmailByOauthCodeResponse.email,
    });
    if (!generateTokenResponse.ok) {
      response.error = generateTokenResponse.error;
      return response;
    }
    response.ok = true;
    response.authToken = generateTokenResponse.authToken;
    response.email = getEmailByOauthCodeResponse.email;

    return response;
  };
}

export default OauthService;
