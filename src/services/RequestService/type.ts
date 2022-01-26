import {
  IBaseServiceRequest,
  IBaseServiceResponse,
} from '@services/BaseService/type';
import { ICareer } from '@controllers/AuthController/type';
import {
  IAgree,
  IAnswer,
  ICandidateRequest,
  ICorporateRequest,
  IReceiverRequest,
} from '@controllers/RequestController/type';

export interface IRequestRegisterRequest extends IBaseServiceRequest {
  userId: number;
  name: string;
  phone: string;
  careers: Array<ICareer>;
  question: string;
  deadline: Date | null;
}

export interface IRequestRegisterResponse extends IBaseServiceResponse {
  code: string;
}

export interface IRequestGetReceiverRequest extends IBaseServiceRequest {
  requestId: number;
  userId: number;
}

export interface IRequestGetReceiverResponse extends IBaseServiceResponse {
  corporateName: string;
  candidateName: string;
  question: string;
}

export interface IRequestGetCorporateRequest extends IBaseServiceRequest {
  requestId: number;
  userId: number;
}

export interface IRequestGetCorporateResponse extends IBaseServiceResponse {
  candidateName: string;
  question: string;
  answers: Array<IAnswer>;
}

export interface IRequestGetCandidateRequest extends IBaseServiceRequest {
  requestId: number;
  candidateId: number;
}

export interface IRequestGetCandidateResponse extends IBaseServiceResponse {
  corporateName: string;
  careers: Array<ICareer>;
}

export interface IRequestListReceiverRequest extends IBaseServiceRequest {
  userId: number;
}

export interface IRequestListReceiverResponse extends IBaseServiceResponse {
  requests: Array<IReceiverRequest>;
}

export interface IRequestListCorporateRequest extends IBaseServiceRequest {
  userId: number;
}

export interface IRequestListCorporateResponse extends IBaseServiceResponse {
  requests: Array<ICorporateRequest>;
}

export interface IRequestListCandidateRequest extends IBaseServiceRequest {
  candidateId: number;
}

export interface IRequestListCandidateResponse extends IBaseServiceResponse {
  requests: Array<ICandidateRequest>;
}

export interface IRequestAgreeRequest extends IBaseServiceRequest {
  candidateId: number;
  requestId: number;
  agrees: Array<IAgree>;
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

export interface IRequestRejectRequest extends IBaseServiceRequest {
  requestId: number;
  userId: number;
}

export interface IRequestRejectResponse extends IBaseServiceResponse {}

export interface IRequestUpdateReceiverRequest extends IBaseServiceRequest {
  userId: number;
}

export interface IRequestUpdateReceiverResponse extends IBaseServiceResponse {}
