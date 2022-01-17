import {
  IBaseServiceRequest,
  IBaseServiceResponse,
} from '@services/BaseService/type';
import { ICareer } from '@controllers/AuthController/type';
import {
  IAgree,
  ICandidateRequest,
  IReceiverRequest,
} from '@controllers/RequestController/type';

export interface IRequestRegisterRequest extends IBaseServiceRequest {
  userId: number;
  name: string;
  phone: string;
  career: Array<ICareer>;
  question: string;
  deadline?: Date | null;
}

export interface IRequestRegisterResponse extends IBaseServiceResponse {
  code: string;
}

export interface IRequestGetReceiverRequest extends IBaseServiceRequest {
  requestId: string;
  userId: number;
}

export interface IRequestGetReceiverResponse extends IBaseServiceResponse {
  corporateName: string;
  candidateName: string;
  question: string;
}

export interface IRequestGetCandidateRequest extends IBaseServiceRequest {
  requestId: string;
  candidateId: number;
}

export interface IRequestGetCandidateResponse extends IBaseServiceResponse {
  corporateName: string;
  career: Array<ICareer>;
}

export interface IRequestListReceiverRequest extends IBaseServiceRequest {
  userId: number;
}

export interface IRequestListReceiverResponse extends IBaseServiceResponse {
  request: Array<IReceiverRequest>;
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

export interface IRequestVerifyRequest extends IBaseServiceRequest {
  requestId: number;
  userId: number;
  candidatePhone: string;
}

export interface IRequestVerifyResponse extends IBaseServiceResponse {}

export interface IRequestAnswerRequest extends IBaseServiceRequest {
  requestId: number;
  userId: number;
  answer: string;
}

export interface IRequestAnswerResponse extends IBaseServiceResponse {}
