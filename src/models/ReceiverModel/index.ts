import { Model, DataTypes, Sequelize } from 'sequelize';
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
  declare answer: string | null;
  declare status: TReceiverStatus;
  declare arrivedAt: Date;
  declare verifiedAt: Date | null;
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
      defaultValue: null,
    },
    status: {
      type: DataTypes.ENUM(
        'arrived',
        'verified',
        'rejected',
        'answered',
        'closed'
      ),
      defaultValue: 'arrived',
      allowNull: false,
    },
    arrivedAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.fn('now'),
      allowNull: false,
    },
    verifiedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
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
    modelName: 'Receiver',
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
