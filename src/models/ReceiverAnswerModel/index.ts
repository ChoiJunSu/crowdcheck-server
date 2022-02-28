import { Model, DataTypes, Sequelize } from 'sequelize';
import {
  IReceiverAnswerAttributes,
  IReceiverAnswerCreationAttributes,
} from '@models/ReceiverAnswerModel/type';
import ReceiverModel from '@models/ReceiverModel';

class ReceiverAnswerModel
  extends Model<IReceiverAnswerAttributes, IReceiverAnswerCreationAttributes>
  implements IReceiverAnswerAttributes
{
  declare id: number;
  declare receiverId: number;
  declare workExperience: number;
  declare workExperienceDescription: string;
  declare roleFit: number;
  declare roleFitDescription: string;
  declare collaborationAbility: number;
  declare collaborationAbilityDescription: string;
  declare hardWorking: number;
  declare hardWorkingDescription: string;
  declare recommendedSalary: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare static associations: {};
}

export const initReceiverAnswerModel = (sequelize: Sequelize) => {
  ReceiverAnswerModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      workExperience: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      workExperienceDescription: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      roleFit: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      roleFitDescription: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      collaborationAbility: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      collaborationAbilityDescription: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      hardWorking: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      hardWorkingDescription: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      recommendedSalary: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      underscored: false,
      modelName: 'ReceiverAnswer',
      tableName: 'receiverAnswer',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    }
  );

  ReceiverModel.hasOne(ReceiverAnswerModel, {
    foreignKey: 'receiverId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  ReceiverAnswerModel.belongsTo(ReceiverModel, {
    foreignKey: 'receiverId',
  });
};

export default ReceiverAnswerModel;
