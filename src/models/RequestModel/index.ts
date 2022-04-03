import { Model, DataTypes, Sequelize } from 'sequelize';
import {
  IRequestAttributes,
  IRequestCreationAttributes,
  TRequestStatus,
} from '@models/RequestModel/type';
import CorporateModel from '@models/CorporateModel';
import ReceiverModel from '@models/ReceiverModel';
import AgreeModel from '@models/AgreeModel';
import UserModel from '@models/UserModel';
import ReferenceModel from '@models/ReferenceModel';

class RequestModel
  extends Model<IRequestAttributes, IRequestCreationAttributes>
  implements IRequestAttributes
{
  declare id: number;
  declare ownerId: number;
  declare corporateId: number;
  declare candidateId: number | null;
  declare candidateName: string;
  declare candidatePhone: string;
  declare deadline: Date;
  declare status: TRequestStatus;
  declare registeredAt: Date;
  declare agreedAt: Date | null;
  declare closedAt: Date | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare readonly Corporate?: CorporateModel;
  declare readonly Agrees?: Array<AgreeModel>;
  declare readonly Receivers?: Array<ReceiverModel>;

  declare static associations: {};
}

export const initRequestModel = (sequelize: Sequelize) => {
  RequestModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      ownerId: {
        type: DataTypes.INTEGER,
        defaultValue: false,
      },
      corporateId: {
        type: DataTypes.INTEGER,
        defaultValue: false,
      },
      candidateId: {
        type: DataTypes.INTEGER,
        defaultValue: null,
      },
      candidateName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      candidatePhone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      deadline: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('registered', 'agreed', 'closed'),
        defaultValue: 'registered',
        allowNull: false,
      },
      registeredAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('now'),
        allowNull: false,
      },
      agreedAt: {
        type: DataTypes.DATE,
        defaultValue: null,
      },
      closedAt: {
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
      modelName: 'Request',
      tableName: 'Request',
      paranoid: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    }
  );

  UserModel.hasMany(RequestModel, {
    foreignKey: 'ownerId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  RequestModel.belongsTo(UserModel, {
    foreignKey: 'ownerId',
  });

  CorporateModel.hasOne(RequestModel, {
    foreignKey: 'corporateId',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  });
  RequestModel.belongsTo(CorporateModel, {
    foreignKey: 'corporateId',
  });

  UserModel.hasMany(RequestModel, {
    foreignKey: 'candidateId',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
  RequestModel.belongsTo(UserModel, {
    foreignKey: 'candidateId',
  });
};

export default RequestModel;
