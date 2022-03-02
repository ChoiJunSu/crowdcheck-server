import { Optional } from 'sequelize';

export type TReceiverStatus = 'received' | 'verified' | 'rejected' | 'answered';

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
  receivedAt?: Date;
  answeredAt?: Date | null;
  closedAt?: Date | null;
}

export interface IReceiverCreationAttributes
  extends Optional<IReceiverAttributes, 'id'> {}
