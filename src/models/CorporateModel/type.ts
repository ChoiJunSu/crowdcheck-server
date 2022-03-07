import { Optional } from 'sequelize';

export interface ICorporateAttributes {
  id?: number;
  name: string;
  certificateBucket?: string | null;
  certificateKey?: string | null;
  verifiedAt?: Date | null;
}

export interface ICorporateCreationAttributes
  extends Optional<ICorporateAttributes, 'id'> {}
