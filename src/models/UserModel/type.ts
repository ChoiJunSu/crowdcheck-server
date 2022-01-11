import { Optional } from 'sequelize';
import { TOauthProvider } from '@controllers/AuthController/type';

export type TUserType = 'personal' | 'corporate';

export interface IUserAttributes {
  id?: number;
  email: string;
  hashed?: string | null;
  name: string;
  phone: string;
  type: TUserType;
  oauthProvider?: TOauthProvider | null;
  corporateId?: number | null;
  credit?: number;
}

export interface IUserCreationAttributes
  extends Optional<IUserAttributes, 'id'> {}
