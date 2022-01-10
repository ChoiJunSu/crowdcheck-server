import { Optional } from 'sequelize';

export interface ICorporateAttributes {
  id?: number;
  name: string;
}

export interface ICorporateCreationAttributes
  extends Optional<ICorporateAttributes, 'id'> {}
