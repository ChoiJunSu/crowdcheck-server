import {
  IBaseServiceRequest,
  IBaseServiceResponse,
} from '@services/BaseService/type';
import { TOauthProvider } from '@models/UserModel/type';

export interface IOauthGetEmailByOauthCodeRequest extends IBaseServiceRequest {
  provider: TOauthProvider;
  code: string;
  redirectUri: string;
}

export interface IOauthGetEmailByOauthCodeResponse
  extends IBaseServiceResponse {
  email: string;
}

export interface IRequestUpdateCandidateRequest extends IBaseServiceRequest {
  name: string;
  phone: string;
}

export interface IRequestUpdateCandidateResponse extends IBaseServiceResponse {}

export interface IRequestUpdateReceiverRequest extends IBaseServiceRequest {
  userId: number;
}

export interface IRequestUpdateReceiverResponse extends IBaseServiceResponse {}
