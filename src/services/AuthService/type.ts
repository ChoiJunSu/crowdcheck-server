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

export interface IRegisterTokenPayload extends JwtPayload {
  provider: TOauthProvider;
  email: string;
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
  registerToken: string;
}

export interface IAuthLoginCandidateRequest extends IBaseServiceRequest {
  name: string;
  phone: string;
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
  careers: Array<ICareer>;
}

export interface IAuthRegisterPersonalResponse extends IBaseServiceResponse {}

export interface IAuthRegisterOauthRequest extends IBaseServiceRequest {
  name: string;
  phone: string;
  careers: Array<ICareer>;
  registerToken: string;
}

export interface IAuthRegisterOauthResponse extends IBaseServiceResponse {}

export interface IAuthRegisterCorporateRequest extends IBaseServiceRequest {
  name: string;
  certificate: Express.MulterS3.File;
  phone: string;
  email: string;
  password: string;
}

export interface IAuthRegisterCorporateResponse extends IBaseServiceResponse {}

export interface IAuthPhoneSendRequest extends IBaseServiceRequest {
  phone: string;
}

export interface IAuthPhoneSendResponse extends IBaseServiceResponse {}

export interface IAuthPhoneVerifyRequest extends IBaseServiceRequest {
  phone: string;
  code: number;
}

export interface IAuthPhoneVerifyResponse extends IBaseServiceResponse {}
