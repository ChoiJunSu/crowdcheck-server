import { JwtPayload } from 'jsonwebtoken';
import {
  IBaseServiceRequest,
  IBaseServiceResponse,
} from '@services/BaseService/type';
import { TOauthProvider } from '@controllers/AuthController/type';

export interface IAuthTokenPayload extends JwtPayload {
  email: string;
}

export interface IOauthLoginRequest extends IBaseServiceRequest {
  provider: TOauthProvider;
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

export interface ICorporateLoginRequest extends IBaseServiceRequest {
  email: string;
  password: string;
}

export interface ICorporateLoginResponse extends IBaseServiceResponse {
  authToken: string;
}

export interface ICorporateRegisterRequest extends IBaseServiceRequest {
  name: string;
  phone: string;
  email: string;
  password: string;
}

export interface ICorporateRegisterResponse extends IBaseServiceResponse {}
