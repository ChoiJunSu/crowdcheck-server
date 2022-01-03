import { JwtPayload } from 'jsonwebtoken';
import {
  IBaseServiceRequest,
  IBaseServiceResponse,
} from '@services/BaseService/type';

export interface IAuthTokenPayload extends JwtPayload {
  email: string;
}

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
}

export interface IRenewAuthTokenRequest extends IBaseServiceRequest {
  authorization: string;
}

export interface IRenewAuthTokenResponse extends IBaseServiceResponse {
  authToken: string;
}
