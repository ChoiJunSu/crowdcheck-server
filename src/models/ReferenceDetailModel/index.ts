import { Model, DataTypes, Sequelize } from 'sequelize';
import {
  IReferenceDetailAttributes,
  IReferenceDetailCreationAttributes,
} from '@models/ReferenceDetailModel/type';
import ReferenceModel from '@models/ReferenceModel';

class ReferenceDetailModel
  extends Model<IReferenceDetailAttributes, IReferenceDetailCreationAttributes>
  implements IReferenceDetailAttributes
{
  declare id: number;
  declare referenceId: number;
  declare question: string;
  declare score: number | null;
  declare answer: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare static associations: {};
}

export const initReferenceDetailModel = (sequelize: Sequelize) => {
  ReferenceDetailModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      referenceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      question: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      score: {
        type: DataTypes.INTEGER,
        defaultValue: null,
      },
      answer: {
        type: DataTypes.STRING,
        allowNull: false,
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
      modelName: 'ReferenceDetail',
      tableName: 'ReferenceDetail',
      paranoid: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    }
  );

  ReferenceModel.hasMany(ReferenceDetailModel, {
    foreignKey: 'referenceId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  ReferenceDetailModel.belongsTo(ReferenceModel, {
    foreignKey: 'referenceId',
  });
};

export default ReferenceDetailModel;
