import { JwtPayload } from 'jsonwebtoken';
import {
  IBaseServiceRequest,
  IBaseServiceResponse,
} from '@services/BaseService/type';
import { ICareer, TOauthProvider } from '@controllers/AuthController/type';
import { TUserType } from '@models/UserModel/type';

export interface IAuthTokenPayload extends JwtPayload {
  id: number;
  name: string;
  type: TUserType;
}

export interface IAuthLoginRequest extends IBaseServiceRequest {
  email: string;
  password: string;
  type: TUserType;
}

export interface IAuthLoginResponse extends IBaseServiceResponse {
  authToken: string;
}

export interface IAuthLoginOauthRequest extends IBaseServiceRequest {
  provider: TOauthProvider;
  code: string;
  redirectUri: string;
}

export interface IAuthLoginOauthResponse extends IBaseServiceResponse {
  authToken: string;
}

export interface IAuthLoginCandidateRequest extends IBaseServiceRequest {
  name: string;
  phone: string;
  code: string;
}

export interface IAuthLoginCandidateResponse extends IBaseServiceResponse {
  authToken: string;
}

export interface IAuthTokenRenewRequest extends IBaseServiceRequest {
  authorization: string;
}

export interface IAuthTokenRenewResponse extends IBaseServiceResponse {
  authToken: string;
}

export interface IAuthRegisterPersonalRequest extends IBaseServiceRequest {
  name: string;
  phone: string;
  email: string;
  password: string;
  career: Array<ICareer>;
}

export interface IAuthRegisterPersonalResponse extends IBaseServiceResponse {}

export interface IAuthRegisterCorporateRequest extends IBaseServiceRequest {
  name: string;
  phone: string;
  email: string;
  password: string;
}

export interface IAuthRegisterCorporateResponse extends IBaseServiceResponse {}
