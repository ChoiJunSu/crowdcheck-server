import { Optional } from 'sequelize';

export interface IPhoneVerifyVerifyAttributes {
  id?: number;
  phone: string;
  code: number;
  verifiedAt?: Date | null;
}

export interface IPhoneVerifyVerifyCreationAttributes
  extends Optional<IPhoneVerifyVerifyAttributes, 'id'> {}
