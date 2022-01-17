import { Optional } from 'sequelize';

export type TRequestStatus = 'registered' | 'agreed' | 'closed';

export interface IRequestAttributes {
  id?: number;
  corporateId: number;
  question: string;
  deadline: Date;
  agreeDescription?: string | null;
  status?: TRequestStatus;
  registeredAt?: Date;
  agreedAt?: Date | null;
  closedAt?: Date | null;
}

export interface IRequestCreationAttributes
  extends Optional<IRequestAttributes, 'id'> {}
