import { Optional } from 'sequelize';

export type TReceiverStatus =
  | 'arrived'
  | 'verified'
  | 'rejected'
  | 'answered'
  | 'closed';

export interface IReceiverAttributes {
  id?: number;
  requestId: number;
  userId: number;
  corporateId: number;
  answer?: string | null;
  status?: TReceiverStatus;
  arrivedAt?: Date;
  verifiedAt?: Date | null;
  rejectedAt?: Date | null;
  answeredAt?: Date | null;
  closedAt?: Date | null;
}

export interface IReceiverCreationAttributes
  extends Optional<IReceiverAttributes, 'id'> {}
