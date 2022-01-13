import { Optional } from 'sequelize';

export interface ICandidateAgreeAttributes {
  id?: number;
  requestId: number;
  corporateId: number;
  candidateId: number;
  department?: string | null;
  startAt: Date;
  endAt?: Date | null;
  agreedAt?: Date | null;
}

export interface ICandidateAgreeCreationAttributes
  extends Optional<ICandidateAgreeAttributes, 'id'> {}
