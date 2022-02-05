export type TOauthProvider = 'google' | 'kakao';

export interface ICareer {
  id: number;
  corporateId: number;
  corporateName: string;
  department: string | null;
  startAt: Date;
  endAt: Date | null;
  verifiedAt?: Date | null;
}
