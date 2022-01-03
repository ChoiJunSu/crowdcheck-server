import {
  IBaseControllerRequest,
  IBaseControllerResponse,
} from '@controllers/BaseController/type';

export interface IGetOauthLoginRequest extends IBaseControllerRequest {
  provider: string;
  code: string;
  redirectUri: string;
}

export interface IGetOauthLoginResponse extends IBaseControllerResponse {
  authToken: string;
}
