import { Optional } from 'sequelize';

export interface ICandidateAgreeAttributes {
  id?: number;
  requestId: number;
  corporateId: number;
  candidateId: number;
  department?: string | null;
  startAt: Date;
  endAt: Date;
  agreedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICandidateAgreeCreationAttributes
  extends Optional<ICandidateAgreeAttributes, 'id'> {}
