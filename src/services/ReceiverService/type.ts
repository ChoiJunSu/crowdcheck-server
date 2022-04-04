import {
  IBaseServiceRequest,
  IBaseServiceResponse,
} from '@services/BaseService/type';
import { TReferenceType } from '@models/ReferenceModel/type';
import { IReferenceDetail } from '@services/ReferenceService/type';
import { IRequestReceiver } from '@services/RequestService/type';
import { ICareer } from '@services/UserService/type';

export interface IReceiverGetVerifyRequest extends IBaseServiceRequest {
  requestId: number;
  userId: number;
}

export interface IReceiverGetVerifyResponse extends IBaseServiceResponse {
  candidateName: string;
  career: ICareer | null;
}

export interface IReceiverVerifyRequest extends IBaseServiceRequest {
  requestId: number;
  userId: number;
  candidatePhone: string;
}

export interface IReceiverVerifyResponse extends IBaseServiceResponse {}

export interface IReceiverGetAnswerRequest extends IBaseServiceRequest {
  requestId: number;
  userId: number;
}

export interface IReceiverGetAnswerResponse extends IBaseServiceResponse {
  request: IRequestReceiver | null;
}

export interface IReceiverAnswerRequest extends IBaseServiceRequest {
  requestId: number;
  userId: number;
  type: TReferenceType;
  relationship: string;
  details: Array<IReferenceDetail>;
}

export interface IReceiverAnswerResponse extends IBaseServiceResponse {}

export interface IReceiverRejectRequest extends IBaseServiceRequest {
  requestId: number;
  userId: number;
}

export interface IReceiverRejectResponse extends IBaseServiceResponse {}
