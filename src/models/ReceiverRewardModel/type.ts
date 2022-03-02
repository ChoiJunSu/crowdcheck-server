import { Optional } from 'sequelize';

export interface IReceiverRewardAttributes {
  id?: number;
  receiverId: number;
  amount: number;
  rewardedAt?: Date | null;
}

export interface IReceiverRewardCreationAttributes
  extends Optional<IReceiverRewardAttributes, 'id'> {}
