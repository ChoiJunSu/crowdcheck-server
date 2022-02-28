import { Model, DataTypes, Sequelize } from 'sequelize';
import {
  ICandidatePortfolioAttributes,
  ICandidatePortfolioCreationAttributes,
} from '@models/CandidatePortfolioModel/type';
import RequestModel from '@models/RequestModel';

class CandidatePortfolioModel
  extends Model<
    ICandidatePortfolioAttributes,
    ICandidatePortfolioCreationAttributes
  >
  implements ICandidatePortfolioAttributes
{
  declare id: number;
  declare requestId: number;
  declare portfolioBucket: string;
  declare portfolioKey: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare static associations: {};
}

export const initCandidatePortfolioModel = (sequelize: Sequelize) => {
  CandidatePortfolioModel.init(
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
      portfolioBucket: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      portfolioKey: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      underscored: false,
      modelName: 'CandidatePortfolio',
      tableName: 'candidatePortfolio',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    }
  );

  RequestModel.hasOne(CandidatePortfolioModel, {
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  CandidatePortfolioModel.belongsTo(RequestModel, {
    foreignKey: 'requestId',
  });
};

export default CandidatePortfolioModel;
