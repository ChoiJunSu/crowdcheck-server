import {
  IBaseServiceRequest,
  IBaseServiceResponse,
} from '@services/BaseService/type';
import { IUser } from '@controllers/UserController/type';
import { ICareer } from '@controllers/AuthController/type';
import { TExpertSpecialty } from '@models/ExpertModel/type';

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

export interface IUserGetExpertRequest extends IBaseServiceRequest {
  userId: number;
}

export interface IUserGetExpertResponse extends IBaseServiceResponse {
  user: IUser | null;
  specialty: TExpertSpecialty | null;
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

export interface IUserEditExpertRequest extends IBaseServiceResponse {
  userId: number;
  password: string | null;
}

export interface IUserEditExpertResponse extends IBaseServiceResponse {}

export interface IUserCareerVerifyRequest extends IBaseServiceRequest {
  userId: number;
  careerId: number;
  certificate: Express.MulterS3.File;
}

export interface IUserCareerVerifyResponse extends IBaseServiceResponse {}
