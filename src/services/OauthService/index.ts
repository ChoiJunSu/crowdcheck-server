import {
  IGetEmailByOauthCodeRequest,
  IGetEmailByOauthCodeResponse,
} from '@services/OauthService/type';
import { URLSearchParams } from 'url';
import axios from 'axios';
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  KAKAO_CLIENT_ID,
  KAKAO_CLIENT_SECRET,
} from '@constants/secret';

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
      // get email by oauth code
      switch (provider) {
        case 'kakao': {
          const params = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: KAKAO_CLIENT_ID,
            redirect_uri: redirectUri,
            code,
            client_secret: KAKAO_CLIENT_SECRET,
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
          response.email = kakao_account.email;
          break;
        }

        case 'google': {
          const params = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: GOOGLE_CLIENT_ID,
            redirect_uri: redirectUri,
            code,
            client_secret: GOOGLE_CLIENT_SECRET,
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
          response.email = data.email;
          break;
        }

        default: {
          break;
        }
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = 'Oauth 정보를 불러오는데 실패했습니다.';
    }

    return response;
  };
}

export default OauthService;
