import { Model, DataTypes } from 'sequelize';
import {
  ICandidateAgreeAttributes,
  ICandidateAgreeCreationAttributes,
} from '@models/CandidateAgreeModel/type';
import sequelize from '@models/BaseModel';
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
  declare endAt: Date | null;
  declare agreedAt: Date | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare static associations: {};
}

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
      defaultValue: null,
    },
    agreedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  },
  {
    sequelize,
    underscored: false,
    modelName: 'CandidateAgreeModel',
    tableName: 'candidateAgree',
    paranoid: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  }
);

RequestModel.hasOne(CandidateAgreeModel, {
  foreignKey: 'requestId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
CandidateAgreeModel.belongsTo(RequestModel, {
  foreignKey: 'requestId',
});

CorporateModel.hasOne(CandidateAgreeModel, {
  foreignKey: 'corporateId',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});
CandidateAgreeModel.belongsTo(CorporateModel, {
  foreignKey: 'corporateId',
});

CandidateModel.hasOne(CandidateAgreeModel, {
  foreignKey: 'candidateId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
CandidateAgreeModel.belongsTo(CandidateModel, {
  foreignKey: 'candidateId',
});

export default CandidateAgreeModel;
