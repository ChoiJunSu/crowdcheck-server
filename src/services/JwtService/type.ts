import {
  IBaseServiceRequest,
  IBaseServiceResponse,
} from '@services/BaseService/type';

export interface IGenerateAuthTokenRequest extends IBaseServiceRequest {
  email: string;
}

export interface IGenerateAuthTokenResponse extends IBaseServiceResponse {
  authToken: string;
}

export interface IVerifyAuthTokenRequest extends IBaseServiceRequest {
  authToken: string;
}

export interface IVerifyAuthTokenResponse extends IBaseServiceResponse {}
