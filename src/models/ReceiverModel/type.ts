import { Optional } from 'sequelize';

export type TReceiverStatus = 'received' | 'verified' | 'rejected' | 'answered';

export interface IReceiverAttributes {
  id?: number;
  requestId: number;
  userId: number;
  careerId: number;
  corporateId: number;
  status?: TReceiverStatus;
  receivedAt?: Date;
  verifiedAt?: Date | null;
  rejectedAt?: Date | null;
  answeredAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReceiverCreationAttributes
  extends Optional<IReceiverAttributes, 'id'> {}
