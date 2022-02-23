import { Optional } from 'sequelize';

export interface ICandidateAttributes {
  id?: number;
  requestId: number;
  name: string;
  phone: string;
}

export interface ICandidateCreationAttributes
  extends Optional<ICandidateAttributes, 'id'> {}
