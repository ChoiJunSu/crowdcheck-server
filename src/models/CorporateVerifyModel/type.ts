import { Optional } from 'sequelize';

export interface ICorporateVerifyAttributes {
  id?: number;
  userId: number;
  certificateBucket: string;
  certificateKey: string;
  reviewedAt?: Date | null;
}

export interface ICorporateVerifyCreationAttributes
  extends Optional<ICorporateVerifyAttributes, 'id'> {}
