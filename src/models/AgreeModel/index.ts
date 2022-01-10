import { Model, DataTypes } from 'sequelize';
import {
  IAgreeAttributes,
  IAgreeCreationAttributes,
} from '@models/AgreeModel/type';
import sequelize from '@models/BaseModel';
import RequestModel from '@models/RequestModel';
import CorporateModel from '@models/CorporateModel';
import CandidateModel from '@models/CandidateModel';

class AgreeModel
  extends Model<IAgreeAttributes, IAgreeCreationAttributes>
  implements IAgreeAttributes
{
  declare id: number;
  declare requestId: number;
  declare corporateId: number;
  declare candidateId: number;
  declare startAt: Date;
  declare endAt: Date | null;
  declare agreedAt: Date | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare static associations: {};
}

AgreeModel.init(
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
    modelName: 'AgreeModel',
    tableName: 'agree',
    paranoid: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  }
);

RequestModel.hasOne(AgreeModel, {
  foreignKey: 'requestId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
AgreeModel.belongsTo(RequestModel, {
  foreignKey: 'requestId',
});

CorporateModel.hasOne(AgreeModel, {
  foreignKey: 'corporateId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
AgreeModel.belongsTo(CorporateModel, {
  foreignKey: 'corporateId',
});

CandidateModel.hasOne(AgreeModel, {
  foreignKey: 'candidateId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
AgreeModel.belongsTo(CandidateModel, {
  foreignKey: 'candidateId',
});

export default AgreeModel;
