import { Optional } from 'sequelize';

export interface ICandidateAttributes {
  id?: number;
  requestId: number;
  // reference
  name?: string | null;
  phone?: string | null;
  // reference
  // resume
  resumeBucket?: string | null;
  resumeKey?: string | null;
  portfolioBucket?: string | null;
  portfolioKey?: string | null;
  // resume
}

export interface ICandidateCreationAttributes
  extends Optional<ICandidateAttributes, 'id'> {}
