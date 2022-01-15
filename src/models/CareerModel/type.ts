import { Optional } from 'sequelize';

export interface ICareerAttributes {
  id?: number;
  userId: number;
  corporateId: number;
  department?: string | null;
  startAt: Date;
  endAt: Date;
  verifiedAt?: Date | null;
}

export interface ICareerCreationAttributes
  extends Optional<ICareerAttributes, 'id'> {}
