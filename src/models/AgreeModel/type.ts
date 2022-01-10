import { Optional } from 'sequelize';

export interface IAgreeAttributes {
  id?: number;
  requestId: number;
  corporateId: number;
  candidateId: number;
  startAt: Date;
  endAt?: Date | null;
  agreedAt?: Date | null;
}

export interface IAgreeCreationAttributes
  extends Optional<IAgreeAttributes, 'id'> {}
