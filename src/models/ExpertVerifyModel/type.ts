import { Optional } from 'sequelize';

export interface IExpertVerifyAttributes {
  id?: number;
  userId: number;
  certificateBucket: string;
  certificateKey: string;
  reviewedAt?: Date | null;
}

export interface IExpertVerifyCreationAttributes
  extends Optional<IExpertVerifyAttributes, 'id'> {}
