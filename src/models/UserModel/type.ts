import { Optional } from 'sequelize';

export interface UserAttributes {
  email: string;
}

export interface UserCreationAttributes
  extends Optional<UserAttributes, 'email'> {}
