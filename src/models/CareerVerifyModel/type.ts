import { Optional } from 'sequelize';

export interface ICareerVerifyAttributes {
  id?: number;
  careerId: number;
  certificateBucket: string;
  certificateKey: string;
  verifiedAt?: Date | null;
}

export interface ICareerVerifyCreationAttributes
  extends Optional<ICareerVerifyAttributes, 'id'> {}
