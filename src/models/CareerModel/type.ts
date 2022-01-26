import { Optional } from 'sequelize';

export type TCareerStatus = 'registered' | 'reviewed' | 'verified';

export interface ICareerAttributes {
  id?: number;
  userId: number;
  corporateId: number;
  department?: string | null;
  startAt: Date;
  endAt: Date;
  status?: TCareerStatus;
  registeredAt?: Date;
  reviewedAt?: Date | null;
  verifiedAt?: Date | null;
}

export interface ICareerCreationAttributes
  extends Optional<ICareerAttributes, 'id'> {}
