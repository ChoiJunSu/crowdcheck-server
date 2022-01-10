import { Optional } from 'sequelize';

export type TRequestStatus = 'sent' | 'agreed' | 'closed';

export interface IRequestAttributes {
  id?: number;
  corporateId: number;
  question: string;
  deadline?: Date | null;
  status?: TRequestStatus;
  sentAt?: Date;
  agreedAt?: Date | null;
  closedAt?: Date | null;
}

export interface IRequestCreationAttributes
  extends Optional<IRequestAttributes, 'id'> {}
