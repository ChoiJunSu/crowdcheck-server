import {
  IBaseServiceRequest,
  IBaseServiceResponse,
} from '@services/BaseService/type';

export interface IGetUserByEmailRequest extends IBaseServiceRequest {
  email: string;
}

export interface IGetUserByEmailResponse extends IBaseServiceResponse {
  user: any;
}

export interface ICreateUserRequest extends IBaseServiceRequest {
  email: string;
}

export interface ICreateUserResponse extends IBaseServiceResponse {}
