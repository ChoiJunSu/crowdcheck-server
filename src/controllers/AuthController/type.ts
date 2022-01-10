import {
  IBaseControllerRequest,
  IBaseControllerResponse,
} from '@controllers/BaseController/type';

export type TOauthProvider = 'google' | 'kakao';

export interface IGetOauthLoginRequest extends IBaseControllerRequest {
  provider: TOauthProvider;
  code: string;
  redirectUri: string;
}

export interface IGetOauthLoginResponse extends IBaseControllerResponse {
  authToken: string;
}
