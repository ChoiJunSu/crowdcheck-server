import {
  IBaseServiceRequest,
  IBaseServiceResponse,
} from '@services/BaseService/type';
import { TReceiverStatus } from '@models/ReceiverModel/type';
import { TRequestStatus } from '@models/RequestModel/type';
import { IReferenceCorporate } from '@services/ReferenceService/type';
import { ICareer } from '@services/UserService/type';

export interface IRequestCorporate {
  id: number;
  candidateName: string;
  deadline: Date;
  referenceCount: number;
  status: TRequestStatus;
  createdAt: Date;
}

export interface IRequestReceiver {
  id: number;
  corporateName: string;
  candidateName: string;
  deadline: Date;
  status: TRequestStatus;
  receiverStatus: TReceiverStatus;
  createdAt: Date;
}

export interface IRequestCandidate {
  id: number;
  corporateName: string;
  deadline: Date;
  status: TRequestStatus;
  createdAt: Date;
}

export interface IRequestAgree {
  career: ICareer;
  agreed: boolean;
  disagreeReason: string | null;
}

export interface IRequestRegisterRequest extends IBaseServiceRequest {
  userId: number;
  candidateName: string;
  candidatePhone: string;
}

export interface IRequestRegisterResponse extends IBaseServiceResponse {}

export interface IRequestListCorporateRequest extends IBaseServiceRequest {
  userId: number;
}

export interface IRequestListCorporateResponse extends IBaseServiceResponse {
  requests: Array<IRequestCorporate>;
}

export interface IRequestListReceiverRequest extends IBaseServiceRequest {
  userId: number;
}

export interface IRequestListReceiverResponse extends IBaseServiceResponse {
  requests: Array<IRequestReceiver>;
}
export interface IRequestListCandidateRequest extends IBaseServiceRequest {
  userId: number;
}

export interface IRequestListCandidateResponse extends IBaseServiceResponse {
  requests: Array<IRequestCandidate>;
}

export interface IRequestDetailCorporateRequest extends IBaseServiceRequest {
  requestId: number;
  userId: number;
}

export interface IRequestDetailCorporateResponse extends IBaseServiceResponse {
  request: IRequestCorporate | null;
  nominationReferences: Array<IReferenceCorporate>;
  blindReferences: Array<IReferenceCorporate>;
}

export interface IRequestGetAgreeCorporateRequest extends IBaseServiceRequest {
  requestId: number;
  userId: number;
}

export interface IRequestGetAgreeCorporateResponse
  extends IBaseServiceResponse {
  candidateName: string;
  agrees: Array<IRequestAgree>;
}

export interface IRequestGetAgreeCandidateRequest extends IBaseServiceRequest {
  requestId: number;
  userId: number;
}

export interface IRequestGetAgreeCandidateResponse
  extends IBaseServiceResponse {
  corporateName: string;
  careers: Array<ICareer>;
}

export interface IRequestAgreeRequest extends IBaseServiceRequest {
  userId: number;
  requestId: number;
  agrees: Array<IRequestAgree>;
}

export interface IRequestAgreeResponse extends IBaseServiceResponse {}

export interface IRequestCloseRequest extends IBaseServiceRequest {
  userId: number;
  requestId: number;
}

export interface IRequestCloseResponse extends IBaseServiceResponse {}
