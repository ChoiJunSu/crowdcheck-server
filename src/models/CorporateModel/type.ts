import { Optional } from 'sequelize';

export interface ICorporateAttributes {
  id?: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICorporateCreationAttributes
  extends Optional<ICorporateAttributes, 'id'> {}
