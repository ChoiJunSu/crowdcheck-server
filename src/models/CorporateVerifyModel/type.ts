import { Optional } from 'sequelize';

export interface ICorporateVerifyAttributes {
  id?: number;
  userId: number;
  registration: string;
  verifiedAt?: Date | null;
}

export interface ICorporateVerifyCreationAttributes
  extends Optional<ICorporateVerifyAttributes, 'id'> {}
