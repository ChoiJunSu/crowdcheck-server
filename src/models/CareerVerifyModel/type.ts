import { Optional } from 'sequelize';

export interface ICareerVerifyAttributes {
  id?: number;
  careerId: number;
  certificateBucket: string;
  certificateKey: string;
  reviewedAt?: Date | null;
}

export interface ICareerVerifyCreationAttributes
  extends Optional<ICareerVerifyAttributes, 'id'> {}
