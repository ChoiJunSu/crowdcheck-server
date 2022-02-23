import { TRequestStatus } from '@models/RequestModel/type';
import { TReceiverStatus } from '@models/ReceiverModel/type';

export interface IRequestReferenceReceiver {
  id: number;
  corporateName: string;
  candidateName: string;
  status: TReceiverStatus;
}

export interface IRequestReferenceCorporate {
  id: number;
  candidateName: string;
  status: TRequestStatus;
  receivers: Array<IReceiver>;
}

export interface IRequestReferenceCandidate {
  id: number;
  corporateName: string;
  status: TRequestStatus;
}

export interface IAgree {
  corporateId: number;
  corporateName: string;
  agreed: boolean;
}

export interface IReceiver {
  id: number;
  status: TReceiverStatus;
}

export interface IAnswer {
  id: number;
  corporateName: string;
  status: TReceiverStatus;
  answer: string | null;
}
