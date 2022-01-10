import { Optional } from 'sequelize';

export type TUserType = 'personal' | 'corporate';

export interface IUserAttributes {
  id?: number;
  email: string;
  hashed?: string | null;
  name: string;
  phone: string;
  type: TUserType;
  corporateId?: number | null;
  credit?: number;
}

export interface IUserCreationAttributes
  extends Optional<IUserAttributes, 'id'> {}
