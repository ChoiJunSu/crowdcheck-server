import { Model, DataTypes } from 'sequelize';
import {
  ICandidateAttributes,
  ICandidateCreationAttributes,
} from '@models/CandidateModel/type';
import sequelize from '@models/BaseModel';
import RequestModel from '@models/RequestModel';

class CandidateModel
  extends Model<ICandidateAttributes, ICandidateCreationAttributes>
  implements ICandidateAttributes
{
  declare id: number;
  declare requestId: number;
  declare name: string;
  declare phone: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare static associations: {};
}

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
  },
  {
    sequelize,
    underscored: false,
    modelName: 'CandidateModel',
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

export default CandidateModel;
