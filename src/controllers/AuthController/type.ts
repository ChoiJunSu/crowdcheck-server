export type TOauthProvider = 'google' | 'kakao';

export interface ICareer {
  corporateName: string;
  department?: string | null;
  startAt: Date;
  endAt?: Date | null;
}
