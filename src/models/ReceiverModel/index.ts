import { Model, DataTypes, Sequelize } from 'sequelize';
import {
  IReceiverAttributes,
  IReceiverCreationAttributes,
  TReceiverStatus,
} from '@models/ReceiverModel/type';
import RequestModel from '@models/RequestModel';
import UserModel from '@models/UserModel';
import CorporateModel from '@models/CorporateModel';
import ReceiverAnswerModel from '@models/ReceiverAnswerModel';

class ReceiverModel
  extends Model<IReceiverAttributes, IReceiverCreationAttributes>
  implements IReceiverAttributes
{
  declare id: number;
  declare requestId: number;
  declare userId: number;
  declare answer: string | null;
  declare corporateId: number | null;
  declare verifiedAt: Date | null;
  declare rejectedAt: Date | null;
  declare status: TReceiverStatus;
  declare receivedAt: Date;
  declare answeredAt: Date | null;
  declare closedAt: Date | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare readonly User?: UserModel;
  declare readonly ReceiverAnswer?: ReceiverAnswerModel;

  declare static associations: {};
}

export const initReceiverModel = (sequelize: Sequelize) => {
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
      corporateId: {
        type: DataTypes.INTEGER,
        defaultValue: null,
      },
      answer: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      status: {
        type: DataTypes.ENUM('received', 'verified', 'rejected', 'answered'),
        defaultValue: 'received',
        allowNull: false,
      },
      receivedAt: {
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

  RequestModel.hasMany(ReceiverModel, {
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  ReceiverModel.belongsTo(RequestModel, {
    foreignKey: 'requestId',
  });

  UserModel.hasMany(ReceiverModel, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  ReceiverModel.belongsTo(UserModel, {
    foreignKey: 'userId',
  });

  CorporateModel.hasMany(ReceiverModel, {
    foreignKey: 'corporateId',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  });
  ReceiverModel.belongsTo(CorporateModel, {
    foreignKey: 'corporateId',
  });
};

export default ReceiverModel;
