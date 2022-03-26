import { TRequestStatus } from '@models/RequestModel/type';
import { TReceiverStatus } from '@models/ReceiverModel/type';

export interface IRequestReferenceCorporate {
  id: number;
  candidateName: string;
  deadline: Date | null;
  rewardNum: number;
  rewardAmount: number;
  receiverCount: number;
  status: TRequestStatus;
  createdAt: Date;
}

export interface IRequestReferenceDetailCorporate {
  id: number;
  candidateName: string;
  question: string;
  deadline: Date | null;
  rewardNum: number;
  rewardAmount: number;
  receiverCount: number;
  status: TRequestStatus;
  createdAt: Date;
}

export interface IRequestReferenceAnswerCorporate {
  receiverId: number;
  corporateName: string;
  status: TReceiverStatus;
  answer: string | null;
  answeredAt: Date | null;
}

export interface IRequestReferenceReceiver {
  id: number;
  corporateName: string;
  candidateName: string;
  deadline: Date | null;
  rewardNum: number;
  rewardAmount: number;
  receiverCount: number;
  status: TRequestStatus;
  receiverStatus: TReceiverStatus;
  createdAt: Date;
}

export interface IRequestReferenceDetailReceiver {
  id: number;
  corporateName: string;
  candidateName: string;
  question: string;
  deadline: Date | null;
  rewardNum: number;
  rewardAmount: number;
  receiverCount: number;
  status: TRequestStatus;
  createdAt: Date;
}

export interface IRequestReferenceCandidate {
  id: number;
  corporateName: string;
  status: TRequestStatus;
  createdAt: Date;
}

export interface IAgree {
  corporateId: number;
  corporateName: string;
  agreed: boolean;
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
  deadline: Date | null;
  rewardNum: number;
  rewardAmount: number;
  receiverCount: number;
  status: TRequestStatus;
  createdAt: Date;
}

export interface IRequestResumeAnswerCorporate {
  receiverId: number;
  receiverName: string;
  answeredAt: Date | null;
  workExperience: number;
  workExperienceDescription: string;
  roleFit: number;
  roleFitDescription: string;
  collaborationAbility: number;
  collaborationAbilityDescription: string;
  hardWorking: number;
  hardWorkingDescription: string;
  recommendedSalary: string;
}

export interface IRequestResumeExpert {
  id: number;
  corporateName: string;
  deadline: Date | null;
  rewardNum: number;
  rewardAmount: number;
  receiverCount: number;
  status: TRequestStatus;
  createdAt: Date;
}

export interface IRequestResumeDetailCorporate {
  id: number;
  memo: string;
  question: string;
  deadline: Date | null;
  rewardNum: number;
  rewardAmount: number;
  receiverCount: number;
  status: TRequestStatus;
  createdAt: Date;
}

export interface IRequestResumeDetailExpert {
  id: number;
  corporateName: string;
  question: string;
  deadline: Date | null;
  rewardNum: number;
  rewardAmount: number;
  receiverCount: number;
  status: TRequestStatus;
  createdAt: Date;
}

export interface IRequestResumeGetAnswerExpert {
  id: number;
  corporateName: string;
  question: string;
  resumeUrl: string;
  portfolioUrl: string | null;
}
