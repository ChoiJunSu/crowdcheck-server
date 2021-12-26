import { Optional } from 'sequelize';

export interface IUserAttributes {
  email: string;
}

export interface IUserCreationAttributes
  extends Optional<IUserAttributes, 'email'> {}
