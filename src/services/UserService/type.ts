import {
  IBaseServiceRequest,
  IBaseServiceResponse,
} from '@services/BaseService/type';

export interface IUser {
  email: string;
  name: string;
  phone: string;
}

export interface ICareer {
  id: number;
  corporateId: number;
  corporateName: string;
  department: string | null;
  startAt: Date;
  endAt: Date | null;
  verifiedAt?: Date | null;
}

export interface IUserGetEditPersonalRequest extends IBaseServiceRequest {
  userId: number;
}

export interface IUserGetEditPersonalResponse extends IBaseServiceResponse {
  user: IUser | null;
  careers: Array<ICareer>;
}

export interface IUserGetEditCorporateRequest extends IBaseServiceRequest {
  userId: number;
}

export interface IUserGetEditCorporateResponse extends IBaseServiceResponse {
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

export interface IUserCareerVerifyRequest extends IBaseServiceRequest {
  userId: number;
  careerId: number;
  certificate: Express.MulterS3.File;
}

export interface IUserCareerVerifyResponse extends IBaseServiceResponse {}

export interface IUserWithdrawRequest extends IBaseServiceRequest {
  userId: number;
}

export interface IUserWithdrawResponse extends IBaseServiceResponse {}
