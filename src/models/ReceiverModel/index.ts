import { Model, DataTypes } from 'sequelize';
import {
  IReceiverAttributes,
  IReceiverCreationAttributes,
  TReceiverStatus,
} from '@models/ReceiverModel/type';
import sequelize from '@models/BaseModel';
import RequestModel from '@models/RequestModel';
import UserModel from '@models/UserModel';

class ReceiverModel
  extends Model<IReceiverAttributes, IReceiverCreationAttributes>
  implements IReceiverAttributes
{
  declare id: number;
  declare requestId: number;
  declare userId: number;
  declare answer: string;
  declare status: TReceiverStatus;
  declare arrivedAt: Date;
  declare rejectedAt: Date | null;
  declare answeredAt: Date | null;
  declare closedAt: Date | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare static associations: {};
}

ReceiverModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    requestId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('arrived', 'rejected', 'answered', 'closed'),
      defaultValue: 'arrived',
      allowNull: false,
    },
    arrivedAt: {
      type: DataTypes.DATE,
      defaultValue: new Date(),
      allowNull: false,
    },
    rejectedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    answeredAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    paidAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    closedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  },
  {
    sequelize,
    underscored: false,
    modelName: 'ReceiverModel',
    tableName: 'receiver',
    paranoid: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  }
);

RequestModel.hasOne(ReceiverModel, {
  foreignKey: 'requestId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
ReceiverModel.belongsTo(RequestModel, {
  foreignKey: 'requestId',
});

UserModel.hasOne(ReceiverModel, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
ReceiverModel.belongsTo(UserModel, {
  foreignKey: 'userId',
});

export default ReceiverModel;
