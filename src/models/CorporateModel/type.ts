import { Optional } from 'sequelize';

export interface ICorporateAttributes {
  id?: number;
  name: string;
  address?: string;
  certificateBucket?: string | null;
  certificateKey?: string | null;
  verifiedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICorporateCreationAttributes
  extends Optional<ICorporateAttributes, 'id'> {}
