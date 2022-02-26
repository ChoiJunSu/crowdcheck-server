import { Optional } from 'sequelize';
import { TExpertSpecialty } from '@models/ExpertModel/type';

export type TRequestStatus = 'registered' | 'agreed' | 'closed';

export type TRequestType = 'reference' | 'resume';

export interface IRequestAttributes {
  id?: number;
  question: string;
  deadline: Date;
  type: TRequestType;
  // reference
  corporateId?: number | null;
  agreeDescription?: string | null;
  agreedAt?: Date | null;
  // reference
  // resume
  memo?: string | null;
  specialty?: TExpertSpecialty | null;
  rewardNum?: number | null;
  rewardPrice?: number | null;
  // resume
  status?: TRequestStatus;
  registeredAt?: Date;
  closedAt?: Date | null;
}

export interface IRequestCreationAttributes
  extends Optional<IRequestAttributes, 'id'> {}
