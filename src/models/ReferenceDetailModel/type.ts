import { Optional } from 'sequelize';

export interface IReferenceDetailAttributes {
  id?: number;
  referenceId: number;
  question: string;
  score: number | null;
  answer: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReferenceDetailCreationAttributes
  extends Optional<IReferenceDetailAttributes, 'id'> {}
