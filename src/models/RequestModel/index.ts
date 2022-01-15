import { Model, DataTypes, Sequelize } from 'sequelize';
import {
  IRequestAttributes,
  IRequestCreationAttributes,
  TRequestStatus,
} from '@models/RequestModel/type';
import sequelize from '@models/BaseModel';
import CorporateModel from '@models/CorporateModel';
import CandidateModel from '@models/CandidateModel';

class RequestModel
  extends Model<IRequestAttributes, IRequestCreationAttributes>
  implements IRequestAttributes
{
  declare id: number;
  declare corporateId: number;
  declare question: string;
  declare deadline: Date | null;
  declare agreeDescription: string | null;
  declare status: TRequestStatus;
  declare sentAt: Date;
  declare agreedAt: Date | null;
  declare closedAt: Date | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare readonly Corporate?: CorporateModel;
  declare readonly Candidate?: CandidateModel;

  declare static associations: {};
}

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
      defaultValue: null,
    },
    agreeDescription: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    status: {
      type: DataTypes.ENUM('registered', 'agreed', 'closed'),
      defaultValue: 'registered',
      allowNull: false,
    },
    sentAt: {
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

export default RequestModel;
