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

export interface IRequestResumeCorporate {
  id: number;
  memo: string | null;
  status: TRequestStatus;
  receivers: Array<IReceiver>;
}

export interface IRequestResumeExpert {
  id: number;
  corporateName: string;
  deadline: Date | null;
  rewardNum: number;
  rewardPrice: number;
  receiverCount: number;
}

export interface IRequestResumeDetailExpert {
  id: number;
  corporateName: string;
  question: string;
  deadline: Date | null;
  rewardNum: number;
  rewardPrice: number;
  receiverCount: number;
  status: TRequestStatus;
}

export interface IRequestResumeGetAnswerExpert {
  id: number;
  corporateName: string;
  question: string;
  resumeUrl: string;
  portfolioUrl: string | null;
}
