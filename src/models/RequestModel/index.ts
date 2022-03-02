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
import CandidateResumeModel from '@models/CandidateResumeModel';
import CandidatePortfolioModel from '@models/CandidatePortfolioModel';

class RequestModel
  extends Model<IRequestAttributes, IRequestCreationAttributes>
  implements IRequestAttributes
{
  declare id: number;
  declare question: string;
  declare deadline: Date;
  declare type: TRequestType;
  declare corporateId: number;
  declare agreeDescription: string | null;
  declare agreedAt: Date | null;
  declare memo: string | null;
  declare rewardNum: number;
  declare rewardAmount: number;
  declare status: TRequestStatus;
  declare registeredAt: Date;
  declare closedAt: Date | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare readonly Corporate?: CorporateModel;
  declare readonly Candidate?: CandidateModel;
  declare readonly CandidateAgrees?: Array<CandidateAgreeModel>;
  declare readonly Receivers?: Array<ReceiverModel>;
  declare readonly CandidateResume?: CandidateResumeModel;
  declare readonly CandidatePortfolio?: CandidatePortfolioModel;

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
      question: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      deadline: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('reference', 'resume'),
        allowNull: false,
      },
      corporateId: {
        type: DataTypes.INTEGER,
        defaultValue: false,
      },
      agreeDescription: {
        type: DataTypes.STRING,
        defaultValue: null,
      },
      agreedAt: {
        type: DataTypes.DATE,
        defaultValue: null,
      },
      memo: {
        type: DataTypes.STRING,
        defaultValue: null,
      },
      specialty: {
        type: DataTypes.ENUM('개발', '디자인', '기획', '마케팅'),
        defaultValue: null,
      },
      rewardNum: {
        type: DataTypes.INTEGER,
        defaultValue: null,
      },
      rewardAmount: {
        type: DataTypes.INTEGER,
        defaultValue: null,
      },
      status: {
        type: DataTypes.ENUM('registered', 'agreed', 'closed', 'rewarded'),
        defaultValue: 'registered',
        allowNull: false,
      },
      registeredAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('now'),
        allowNull: false,
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
