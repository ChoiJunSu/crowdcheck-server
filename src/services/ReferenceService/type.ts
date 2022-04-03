import {
  IBaseServiceRequest,
  IBaseServiceResponse,
} from '@services/BaseService/type';
import { TReferenceType } from '@models/ReferenceModel/type';

export interface IReferenceDetail {
  question: string;
  score: number | null;
  answer: string;
}

export interface IReferenceCorporate {
  corporateName: string;
  type: TReferenceType;
  relationship: string;
  createdAt: Date;
  details: Array<IReferenceDetail>;
}

export interface IReferenceCandidate {
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
