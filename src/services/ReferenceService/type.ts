import {
  IBaseServiceRequest,
  IBaseServiceResponse,
} from '@services/BaseService/type';
import { TReferenceType } from '@models/ReferenceModel/type';

export interface IReferenceDetail {
  id: number;
  question: string;
  score: number | null;
  answer: string;
}

export interface IReferenceCorporate {
  id: number;
  corporateName: string;
  type: TReferenceType;
  relationship: string;
  createdAt: Date;
  details: Array<IReferenceDetail>;
}

export interface IReferenceCandidate {
  id: number;
  writerName: string;
  corporateName: string;
  createdAt: Date;
}

export interface IReferenceListCandidateRequest extends IBaseServiceRequest {
  userId: number;
}

export interface IReferenceListCandidateResponse extends IBaseServiceResponse {
  references: Array<IReferenceCandidate>;
}

export interface IReferenceRemoveRequest extends IBaseServiceRequest {
  userId: number;
  referenceId: number;
}

export interface IReferenceRemoveResponse extends IBaseServiceResponse {}
