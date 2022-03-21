import { Optional } from 'sequelize';
import { TOauthProvider } from '@controllers/AuthController/type';

export type TUserType = 'personal' | 'corporate' | 'candidate' | 'expert';

export interface IUserAttributes {
  id?: number;
  email: string;
  hashed?: string | null;
  name: string;
  phone: string;
  type: TUserType;
  // personal or expert
  oauthProvider?: TOauthProvider | null;
  // personal or expert
  // corporate
  corporateId?: number | null;
  credit?: number;
  // corporate
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserCreationAttributes
  extends Optional<IUserAttributes, 'id'> {}
