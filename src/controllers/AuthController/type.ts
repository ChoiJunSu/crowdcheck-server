export type TOauthProvider = 'google' | 'kakao';

export interface ICareer {
  name: string;
  department?: string | null;
  startAt: Date;
  endAt?: Date | null;
}
