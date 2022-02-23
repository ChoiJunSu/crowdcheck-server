import { Model, DataTypes, Sequelize } from 'sequelize';
import {
  ICandidateResumeAttributes,
  ICandidateResumeCreationAttributes,
} from '@models/CandidateResumeModel/type';
import RequestModel from '@models/RequestModel';

class CandidateResumeModel
  extends Model<ICandidateResumeAttributes, ICandidateResumeCreationAttributes>
  implements ICandidateResumeAttributes
{
  declare id: number;
  declare requestId: number;
  declare resumeBucket: string;
  declare resumeKey: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare static associations: {};
}

export const initCandidateResumeModel = (sequelize: Sequelize) => {
  CandidateResumeModel.init(
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
      resumeBucket: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      resumeKey: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      underscored: false,
      modelName: 'CandidateResume',
      tableName: 'candidateResume',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    }
  );

  RequestModel.hasOne(CandidateResumeModel, {
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  CandidateResumeModel.belongsTo(RequestModel, {
    foreignKey: 'requestId',
  });
};

export default CandidateResumeModel;
