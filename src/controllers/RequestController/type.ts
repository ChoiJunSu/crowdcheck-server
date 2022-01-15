import { TRequestStatus } from '@models/RequestModel/type';

export interface ICandidateRequest {
  id: number;
  corporateName: string;
  status: TRequestStatus;
}

export interface IAgree {
  corporateId: number;
  agreed: boolean;
}
