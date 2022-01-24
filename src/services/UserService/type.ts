import {
  IBaseServiceRequest,
  IBaseServiceResponse,
} from '@services/BaseService/type';
import { IUser } from '@controllers/UserController/type';
import { ICareer } from '@controllers/AuthController/type';

export interface IUserGetPersonalRequest extends IBaseServiceRequest {
  userId: number;
}

export interface IUserGetPersonalResponse extends IBaseServiceResponse {
  user: IUser | null;
  careers: Array<ICareer>;
}

export interface IUserGetCorporateRequest extends IBaseServiceRequest {
  userId: number;
}

export interface IUserGetCorporateResponse extends IBaseServiceResponse {
  user: IUser | null;
}

export interface IUserEditPersonalRequest extends IBaseServiceRequest {
  userId: number;
  password: string | null;
  careers: Array<ICareer>;
}

export interface IUserEditPersonalResponse extends IBaseServiceResponse {}

export interface IUserEditCorporateRequest extends IBaseServiceResponse {
  userId: number;
  password: string | null;
}

export interface IUserEditCorporateResponse extends IBaseServiceResponse {}
