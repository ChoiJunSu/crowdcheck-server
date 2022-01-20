export type TOauthProvider = 'google' | 'kakao';

export interface ICareer {
  corporateId: number;
  corporateName: string;
  department: string | null;
  startAt: Date;
  endAt: Date | null;
}
