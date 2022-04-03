import { Model, DataTypes, Sequelize } from 'sequelize';
import {
  IReceiverAttributes,
  IReceiverCreationAttributes,
  TReceiverStatus,
} from '@models/ReceiverModel/type';
import RequestModel from '@models/RequestModel';
import UserModel from '@models/UserModel';
import CareerModel from '@models/CareerModel';
import CorporateModel from '@models/CorporateModel';

class ReceiverModel
  extends Model<IReceiverAttributes, IReceiverCreationAttributes>
  implements IReceiverAttributes
{
  declare id: number;
  declare requestId: number;
  declare userId: number;
  declare careerId: number;
  declare corporateId: number;
  declare status: TReceiverStatus;
  declare receivedAt: Date;
  declare verifiedAt: Date | null;
  declare rejectedAt: Date | null;
  declare answeredAt: Date | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare readonly Request?: RequestModel;
  declare readonly Corporate?: CorporateModel;

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
      careerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      corporateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('NOW()'),
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('NOW()'),
      },
    },
    {
      sequelize,
      underscored: false,
      modelName: 'Receiver',
      tableName: 'Receiver',
      paranoid: true,
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

  CareerModel.hasMany(ReceiverModel, {
    foreignKey: 'careerId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  ReceiverModel.belongsTo(CareerModel, {
    foreignKey: 'careerId',
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
