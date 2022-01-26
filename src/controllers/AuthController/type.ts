import { TCareerStatus } from '@models/CareerModel/type';

export type TOauthProvider = 'google' | 'kakao';

export interface ICareer {
  id: number;
  corporateId: number;
  corporateName: string;
  department: string | null;
  startAt: Date;
  endAt: Date | null;
  status?: TCareerStatus;
}
