import { Optional } from 'sequelize';

export interface ICorporateAttributes {
  name: string;
  phone: string;
  email: string;
  hashed: string;
}

export interface ICorporateCreationAttributes
  extends Optional<ICorporateAttributes, 'name'> {}
