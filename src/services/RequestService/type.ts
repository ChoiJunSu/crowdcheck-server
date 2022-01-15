import {
  IBaseServiceRequest,
  IBaseServiceResponse,
} from '@services/BaseService/type';
import { ICareer } from '@controllers/AuthController/type';
import { IAgree, ICandidateRequest } from '@controllers/RequestController/type';

export interface IRequestRegisterRequest extends IBaseServiceRequest {
  corporateId: number;
  name: string;
  phone: string;
  career: Array<ICareer>;
  question: string;
  deadline?: Date | null;
}

export interface IRequestRegisterResponse extends IBaseServiceResponse {
  code: string;
}

export interface IRequestGetCandidateRequest extends IBaseServiceRequest {
  requestId: string;
  candidateId: number;
}

export interface IRequestGetCandidateResponse extends IBaseServiceResponse {
  career: Array<ICareer>;
}

export interface IRequestListCandidateRequest extends IBaseServiceRequest {
  candidateId: number;
}

export interface IRequestListCandidateResponse extends IBaseServiceResponse {
  request: Array<ICandidateRequest>;
}

export interface IRequestAgreeRequest extends IBaseServiceRequest {
  requestId: number;
  agree: Array<IAgree>;
  agreeDescription: string;
}

export interface IRequestAgreeResponse extends IBaseServiceResponse {}
