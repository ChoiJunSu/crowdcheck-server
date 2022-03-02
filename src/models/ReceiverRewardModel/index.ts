import { Model, DataTypes, Sequelize } from 'sequelize';
import {
  IReceiverRewardAttributes,
  IReceiverRewardCreationAttributes,
} from '@models/ReceiverRewardModel/type';
import ReceiverModel from '@models/ReceiverModel';

class ReceiverRewardModel
  extends Model<IReceiverRewardAttributes, IReceiverRewardCreationAttributes>
  implements IReceiverRewardAttributes
{
  declare id: number;
  declare receiverId: number;
  declare amount: number;
  declare rewardedAt: Date | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare static associations: {};
}

export const initReceiverRewardModel = (sequelize: Sequelize) => {
  ReceiverRewardModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      rewardedAt: {
        type: DataTypes.DATE,
        defaultValue: null,
      },
    },
    {
      sequelize,
      underscored: false,
      modelName: 'ReceiverReward',
      tableName: 'receiverReward',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    }
  );

  ReceiverModel.hasOne(ReceiverRewardModel, {
    foreignKey: 'receiverId',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  });
  ReceiverRewardModel.belongsTo(ReceiverModel, {
    foreignKey: 'receiverId',
  });
};

export default ReceiverRewardModel;
