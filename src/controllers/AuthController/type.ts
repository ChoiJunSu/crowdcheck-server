import {
  IBaseControllerRequest,
  IBaseControllerResponse,
} from '@controllers/BaseController/type';
import { TUserType } from '@models/UserModel/type';

export type TOauthProvider = 'google' | 'kakao';

export interface IPostLoginRequest extends IBaseControllerRequest {
  email: string;
  password: string;
  type: TUserType;
}

export interface IPostLoginResponse extends IBaseControllerResponse {
  authToken: string;
}

export interface IGetLoginOauthRequest extends IBaseControllerRequest {
  provider: TOauthProvider;
  code: string;
  redirectUri: string;
}

export interface IGetLoginOauthResponse extends IBaseControllerResponse {
  authToken: string;
}

export interface ICareer {
  name: string;
  department?: string;
  startAt: Date;
  endAt?: Date | null;
}

export interface IPostRegisterPersonalRequest extends IBaseControllerRequest {
  name: string;
  phone: string;
  email: string;
  password: string;
  career: Array<ICareer>;
}

export interface IPostRegisterPersonalResponse
  extends IBaseControllerResponse {}

export interface IPostRegisterCorporateRequest extends IBaseControllerRequest {
  name: string;
  phone: string;
  email: string;
  password: string;
}

export interface IPostRegisterCorporateResponse
  extends IBaseControllerResponse {}
