import { Optional } from 'sequelize';

export type TReferenceType = 'nomination' | 'blind';

export interface IReferenceAttributes {
  id?: number;
  ownerId: number;
  targetId: number;
  writerId: number | null;
  corporateId: number;
  relationship: string;
  type: TReferenceType;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReferenceCreationAttributes
  extends Optional<IReferenceAttributes, 'id'> {}
