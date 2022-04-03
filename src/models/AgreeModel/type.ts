import { Optional } from 'sequelize';

export interface IAgreeAttributes {
  id?: number;
  requestId: number;
  careerId: number;
  corporateId: number;
  disagreeReason: string | null;
  agreedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAgreeCreationAttributes
  extends Optional<IAgreeAttributes, 'id'> {}
