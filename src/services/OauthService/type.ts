import {
  IBaseServiceRequest,
  IBaseServiceResponse,
} from '@services/BaseService/type';

export interface IGetEmailByOauthCodeRequest extends IBaseServiceRequest {
  provider: string;
  code: string;
  redirectUri: string;
}

export interface IGetEmailByOauthCodeResponse extends IBaseServiceResponse {
  email: string;
}

export interface IOauthLoginRequest extends IBaseServiceRequest {
  provider: string;
  code: string;
  redirectUri: string;
}

export interface IOauthLoginResponse extends IBaseServiceResponse {
  authToken: string;
  email: string;
}
