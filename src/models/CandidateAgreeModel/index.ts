import { Model, DataTypes, Sequelize } from 'sequelize';
import {
  ICandidateAgreeAttributes,
  ICandidateAgreeCreationAttributes,
} from '@models/CandidateAgreeModel/type';
import RequestModel from '@models/RequestModel';
import CorporateModel from '@models/CorporateModel';
import CandidateModel from '@models/CandidateModel';

class CandidateAgreeModel
  extends Model<ICandidateAgreeAttributes, ICandidateAgreeCreationAttributes>
  implements ICandidateAgreeAttributes
{
  declare id: number;
  declare requestId: number;
  declare corporateId: number;
  declare candidateId: number;
  declare department: string | null;
  declare startAt: Date;
  declare endAt: Date;
  declare agreedAt: Date | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare static associations: {};
}

export const initCandidateAgreeModel = (sequelize: Sequelize) => {
  CandidateAgreeModel.init(
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
      corporateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      candidateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      department: {
        type: DataTypes.STRING,
      },
      startAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      agreedAt: {
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
      modelName: 'CandidateAgree',
      tableName: 'candidateAgree',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    }
  );

  RequestModel.hasMany(CandidateAgreeModel, {
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  CandidateAgreeModel.belongsTo(RequestModel, {
    foreignKey: 'requestId',
  });

  CorporateModel.hasMany(CandidateAgreeModel, {
    foreignKey: 'corporateId',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  });
  CandidateAgreeModel.belongsTo(CorporateModel, {
    foreignKey: 'corporateId',
  });

  CandidateModel.hasMany(CandidateAgreeModel, {
    foreignKey: 'candidateId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  CandidateAgreeModel.belongsTo(CandidateModel, {
    foreignKey: 'candidateId',
  });
};

export default CandidateAgreeModel;
