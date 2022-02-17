import { Model, DataTypes, Sequelize } from 'sequelize';
import {
  ICandidateAttributes,
  ICandidateCreationAttributes,
} from '@models/CandidateModel/type';
import RequestModel from '@models/RequestModel';
import UserModel from '@models/UserModel';
import CandidateAgreeModel from '@models/CandidateAgreeModel';

class CandidateModel
  extends Model<ICandidateAttributes, ICandidateCreationAttributes>
  implements ICandidateAttributes
{
  declare id: number;
  declare requestId: number;
  declare name: string;
  declare phone: string;
  declare userId: number | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare readonly CandidateAgrees?: Array<CandidateAgreeModel>;

  declare static associations: {};
}

export const initCandidateModel = (sequelize: Sequelize) => {
  CandidateModel.init(
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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        defaultValue: null,
      },
    },
    {
      sequelize,
      underscored: false,
      modelName: 'Candidate',
      tableName: 'candidate',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    }
  );

  RequestModel.hasOne(CandidateModel, {
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  CandidateModel.belongsTo(RequestModel, {
    foreignKey: 'requestId',
  });

  UserModel.hasOne(CandidateModel, {
    foreignKey: 'userId',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
  CandidateModel.belongsTo(UserModel, {
    foreignKey: 'userId',
  });
};

export default CandidateModel;
