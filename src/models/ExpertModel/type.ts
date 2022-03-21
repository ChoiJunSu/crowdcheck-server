import { Optional } from 'sequelize';

export type TExpertSpecialty = '개발' | '디자인' | '기획' | '마케팅';

export interface IExpertAttributes {
  id?: number;
  userId: number;
  specialty: TExpertSpecialty;
  certificateBucket?: string | null;
  certificateKey?: string | null;
  verifiedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IExpertCreationAttributes
  extends Optional<IExpertAttributes, 'id'> {}
