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
  answer?: string | null;
  // reference
  corporateId?: number | null;
  verifiedAt?: Date | null;
  rejectedAt?: Date | null;
  // reference
  status?: TReceiverStatus;
  arrivedAt?: Date;
  answeredAt?: Date | null;
  closedAt?: Date | null;
}

export interface IReceiverCreationAttributes
  extends Optional<IReceiverAttributes, 'id'> {}
