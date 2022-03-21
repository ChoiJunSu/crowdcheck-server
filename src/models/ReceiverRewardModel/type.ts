import { Optional } from 'sequelize';

export interface IReceiverRewardAttributes {
  id?: number;
  receiverId: number;
  amount: number;
  rewardedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReceiverRewardCreationAttributes
  extends Optional<IReceiverRewardAttributes, 'id'> {}
