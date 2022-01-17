import { Optional } from 'sequelize';

export type TReceiverStatus =
  | 'arrived'
  | 'verified'
  | 'rejected'
  | 'answered'
  | 'paid'
  | 'closed';

export interface IReceiverAttributes {
  id?: number;
  requestId: number;
  userId: number;
  answer?: string | null;
  status?: TReceiverStatus;
  arrivedAt?: Date;
  verifiedAt?: Date | null;
  rejectedAt?: Date | null;
  answeredAt?: Date | null;
  paidAt?: Date | null;
  closedAt?: Date | null;
}

export interface IReceiverCreationAttributes
  extends Optional<IReceiverAttributes, 'id'> {}
