import { Optional } from 'sequelize';

export interface ICandidateResumeAttributes {
  id?: number;
  requestId: number;
  resumeBucket: string;
  resumeKey: string;
}

export interface ICandidateResumeCreationAttributes
  extends Optional<ICandidateResumeAttributes, 'id'> {}
