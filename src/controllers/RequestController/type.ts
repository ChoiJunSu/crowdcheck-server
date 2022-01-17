import { TRequestStatus } from '@models/RequestModel/type';
import { TReceiverStatus } from '@models/ReceiverModel/type';

export interface ICandidateRequest {
  id: number;
  corporateName: string;
  status: TRequestStatus;
}

export interface IReceiverRequest {
  id: number;
  corporateName: string;
  candidateName: string;
  status: TReceiverStatus;
}

export interface IAgree {
  corporateId: number;
  agreed: boolean;
}
