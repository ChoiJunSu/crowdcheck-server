import { JwtPayload } from 'jsonwebtoken';
import {
  IBaseServiceRequest,
  IBaseServiceResponse,
} from '@services/BaseService/type';
import { TOauthProvider } from '@controllers/AuthController/type';
import { TUserType } from '@models/UserModel/type';

export interface IAuthTokenPayload extends JwtPayload {
  id: number;
  name: string;
  type: TUserType;
}

export interface ILoginOauthRequest extends IBaseServiceRequest {
  provider: TOauthProvider;
  code: string;
  redirectUri: string;
}

export interface ILoginOauthResponse extends IBaseServiceResponse {
  authToken: string;
}

export interface ITokenRenewRequest extends IBaseServiceRequest {
  authorization: string;
}

export interface ITokenRenewResponse extends IBaseServiceResponse {
  authToken: string;
}

export interface ICorporateLoginRequest extends IBaseServiceRequest {
  email: string;
  password: string;
  type: TUserType;
}

export interface ICorporateLoginResponse extends IBaseServiceResponse {
  authToken: string;
}

export interface IRegisterCorporateRequest extends IBaseServiceRequest {
  name: string;
  phone: string;
  email: string;
  password: string;
}

export interface IRegisterCorporateResponse extends IBaseServiceResponse {}
