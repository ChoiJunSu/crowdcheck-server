import {
  IBaseControllerRequest,
  IBaseControllerResponse,
} from '@controllers/BaseController/type';

export type TOauthProvider = 'google' | 'kakao';

export interface IGetLoginOauthRequest extends IBaseControllerRequest {
  provider: TOauthProvider;
  code: string;
  redirectUri: string;
}

export interface IGetLoginOauthResponse extends IBaseControllerResponse {
  authToken: string;
}
