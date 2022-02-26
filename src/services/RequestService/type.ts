import {
  IBaseServiceRequest,
  IBaseServiceResponse,
} from '@services/BaseService/type';
import { ICareer } from '@controllers/AuthController/type';
import {
  IAgree,
  IAnswer,
  IRequestReferenceCandidate,
  IRequestReferenceCorporate,
  IRequestReferenceReceiver,
  IRequestResumeCorporate,
  IRequestResumeExpert,
} from '@controllers/RequestController/type';
import { TExpertSpecialty } from '@models/ExpertModel/type';

export interface IRequestReferenceRegisterRequest extends IBaseServiceRequest {
  userId: number;
  name: string;
  phone: string;
  careers: Array<ICareer>;
  question: string;
  deadline: Date | null;
}

export interface IRequestReferenceRegisterResponse
  extends IBaseServiceResponse {}

export interface IRequestReferenceGetReceiverRequest
  extends IBaseServiceRequest {
  requestId: number;
  userId: number;
}

export interface IRequestReferenceGetReceiverResponse
  extends IBaseServiceResponse {
  corporateName: string;
  candidateName: string;
  question: string;
}

export interface IRequestReferenceGetCorporateRequest
  extends IBaseServiceRequest {
  requestId: number;
  userId: number;
}

export interface IRequestReferenceGetCorporateResponse
  extends IBaseServiceResponse {
  candidateName: string;
  question: string;
  answers: Array<IAnswer>;
}

export interface IRequestReferenceGetCorporateAgreeRequest
  extends IBaseServiceRequest {
  requestId: number;
  userId: number;
}

export interface IRequestReferenceGetCorporateAgreeResponse
  extends IBaseServiceResponse {
  candidateName: string;
  agrees: Array<IAgree>;
  agreeDescription: string | null;
}

export interface IRequestReferenceGetCandidateRequest
  extends IBaseServiceRequest {
  requestId: number;
  candidateId: number;
}

export interface IRequestReferenceGetCandidateResponse
  extends IBaseServiceResponse {
  corporateName: string;
  careers: Array<ICareer>;
}

export interface IRequestReferenceListReceiverRequest
  extends IBaseServiceRequest {
  userId: number;
}

export interface IRequestReferenceListReceiverResponse
  extends IBaseServiceResponse {
  requests: Array<IRequestReferenceReceiver>;
}

export interface IRequestReferenceListCorporateRequest
  extends IBaseServiceRequest {
  userId: number;
}

export interface IRequestReferenceListCorporateResponse
  extends IBaseServiceResponse {
  requests: Array<IRequestReferenceCorporate>;
}

export interface IRequestReferenceListCandidateRequest
  extends IBaseServiceRequest {
  candidateId: number;
}

export interface IRequestReferenceListCandidateResponse
  extends IBaseServiceResponse {
  requests: Array<IRequestReferenceCandidate>;
}

export interface IRequestReferenceAgreeRequest extends IBaseServiceRequest {
  candidateId: number;
  requestId: number;
  agrees: Array<IAgree>;
  agreeDescription: string;
}

export interface IRequestReferenceAgreeResponse extends IBaseServiceResponse {}

export interface IRequestReferenceVerifyRequest extends IBaseServiceRequest {
  requestId: number;
  userId: number;
  candidatePhone: string;
}

export interface IRequestReferenceVerifyResponse extends IBaseServiceResponse {}

export interface IRequestReferenceAnswerRequest extends IBaseServiceRequest {
  requestId: number;
  userId: number;
  answer: string;
}

export interface IRequestReferenceAnswerResponse extends IBaseServiceResponse {}

export interface IRequestRejectRequest extends IBaseServiceRequest {
  requestId: number;
  userId: number;
}

export interface IRequestRejectResponse extends IBaseServiceResponse {}

export interface IRequestReferenceUpdateReceiverRequest
  extends IBaseServiceRequest {
  userId: number;
}

export interface IRequestReferenceUpdateReceiverResponse
  extends IBaseServiceResponse {}

/*
  Resume
 */

export interface IRequestResumeRegisterRequest extends IBaseServiceRequest {
  userId: number;
  memo: string | null;
  resume: Express.MulterS3.File;
  specialty: TExpertSpecialty;
  question: string;
  deadline: Date | null;
}

export interface IRequestResumeRegisterResponse extends IBaseServiceResponse {}

export interface IRequestResumeListCorporateRequest
  extends IBaseServiceRequest {
  userId: number;
}

export interface IRequestResumeListCorporateResponse
  extends IBaseServiceResponse {
  requests: Array<IRequestResumeCorporate>;
}

export interface IRequestResumeListExpertRequest extends IBaseServiceRequest {
  userId: number;
}

export interface IRequestResumeListExpertResponse extends IBaseServiceResponse {
  requests: Array<IRequestResumeExpert>;
}
