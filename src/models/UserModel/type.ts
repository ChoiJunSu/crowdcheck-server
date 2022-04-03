import { Optional } from 'sequelize';

export type TUserType = 'personal' | 'corporate';

export type TOauthProvider = 'google' | 'kakao';

export interface IUserAttributes {
  id?: number;
  email: string;
  hashed?: string | null;
  name: string;
  phone: string;
  type: TUserType;
  // personal
  oauthProvider?: TOauthProvider | null;
  // personal
  // corporate
  corporateId?: number | null;
  certificateBucket?: string | null;
  certificateKey?: string | null;
  verifiedAt?: Date | null;
  // corporate
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserCreationAttributes
  extends Optional<IUserAttributes, 'id'> {}
