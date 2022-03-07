import { Optional } from 'sequelize';

export type TReceiverStatus = 'received' | 'verified' | 'rejected' | 'answered';

export interface IReceiverAttributes {
  id?: number;
  requestId: number;
  userId: number;
  // reference
  corporateId?: number | null;
  answer?: string | null;
  verifiedAt?: Date | null;
  rejectedAt?: Date | null;
  // reference
  // resume
  workExperience?: number | null;
  workExperienceDescription?: string | null;
  roleFit?: number | null;
  roleFitDescription?: string | null;
  collaborationAbility?: number | null;
  collaborationAbilityDescription?: string | null;
  hardWorking?: number | null;
  hardWorkingDescription?: string | null;
  recommendedSalary?: string | null;
  // resume
  status?: TReceiverStatus;
  receivedAt?: Date;
  answeredAt?: Date | null;
}

export interface IReceiverCreationAttributes
  extends Optional<IReceiverAttributes, 'id'> {}
