import {
  IBaseServiceRequest,
  IBaseServiceResponse,
} from '@services/BaseService/type';

export interface IGenerateTokenRequest extends IBaseServiceRequest {
  email: string;
}

export interface IGenerateTokenResponse extends IBaseServiceResponse {
  authToken: string;
}

export interface IVerifyTokenRequest extends IBaseServiceRequest {
  authToken: string;
}

export interface IVerifyTokenResponse extends IBaseServiceResponse {}
