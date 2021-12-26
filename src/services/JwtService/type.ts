import {
  IBaseServiceRequest,
  IBaseServiceResponse,
} from '@services/BaseService/type';

export interface IGenerateTokenRequest extends IBaseServiceRequest {
  email: string;
}

export interface IGenerateTokenResponse extends IBaseServiceResponse {
  token: any;
}

export interface IVerifyTokenRequest extends IBaseServiceRequest {
  token: any;
}

export interface IVerifyTokenResponse extends IBaseServiceResponse {}
