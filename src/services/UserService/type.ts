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

export interface IUserEditPersonalRequest extends IBaseServiceRequest {
  userId: number;
  name: string;
  password: string | null;
  careers: Array<ICareer>;
}

export interface IUserEditPersonalResponse extends IBaseServiceResponse {}
