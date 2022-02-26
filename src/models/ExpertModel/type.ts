import { Optional } from 'sequelize';

export type TExpertSpecialty = '개발' | '디자인' | '기획' | '마케팅';

export interface IExpertAttributes {
  id?: number;
  userId: number;
  specialty: TExpertSpecialty;
}

export interface IExpertCreationAttributes
  extends Optional<IExpertAttributes, 'id'> {}
