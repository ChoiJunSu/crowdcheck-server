import { Optional } from 'sequelize';

export type TRequestStatus = 'registered' | 'agreed' | 'closed';

export interface IRequestAttributes {
  id?: number;
  ownerId: number;
  corporateId: number;
  candidateId?: number | null;
  candidateName: string;
  candidatePhone: string;
  deadline: Date;
  paidAt?: Date | null;
  status?: TRequestStatus;
  registeredAt?: Date;
  agreedAt?: Date | null;
  closedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRequestCreationAttributes
  extends Optional<IRequestAttributes, 'id'> {}
