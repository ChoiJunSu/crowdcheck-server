import { Model, DataTypes, Sequelize } from 'sequelize';
import {
  IRequestAttributes,
  IRequestCreationAttributes,
  TRequestStatus,
  TRequestType,
} from '@models/RequestModel/type';
import CorporateModel from '@models/CorporateModel';
import CandidateModel from '@models/CandidateModel';
import ReceiverModel from '@models/ReceiverModel';
import CandidateAgreeModel from '@models/CandidateAgreeModel';

class RequestModel
  extends Model<IRequestAttributes, IRequestCreationAttributes>
  implements IRequestAttributes
{
  declare id: number;
  declare corporateId: number;
  declare question: string;
  declare deadline: Date;
  declare agreeDescription: string | null;
  declare type: TRequestType;
  declare status: TRequestStatus;
  declare sentAt: Date;
  declare agreedAt: Date | null;
  declare closedAt: Date | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare readonly Corporate?: CorporateModel;
  declare readonly Candidate?: CandidateModel;
  declare readonly CandidateAgrees?: Array<CandidateAgreeModel>;
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
      corporateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      question: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      deadline: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      agreeDescription: {
        type: DataTypes.STRING,
        defaultValue: null,
      },
      type: {
        type: DataTypes.ENUM('reference', 'resume'),
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
    },
    {
      sequelize,
      underscored: false,
      modelName: 'Request',
      tableName: 'request',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    }
  );

  CorporateModel.hasOne(RequestModel, {
    foreignKey: 'corporateId',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  });
  RequestModel.belongsTo(CorporateModel, {
    foreignKey: 'corporateId',
  });
};

export default RequestModel;
