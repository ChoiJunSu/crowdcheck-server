import { Model, DataTypes, Sequelize } from 'sequelize';
import CareerModel from '@models/CareerModel';
import {
  ICareerVerifyAttributes,
  ICareerVerifyCreationAttributes,
} from '@models/CareerVerifyModel/type';

class CareerVerifyModel
  extends Model<ICareerVerifyAttributes, ICareerVerifyCreationAttributes>
  implements ICareerVerifyAttributes
{
  declare id: number;
  declare careerId: number;
  declare certificateBucket: string;
  declare certificateKey: string;
  declare reviewedAt: Date | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare static associations: {};
}

export const initCareerVerifyModel = (sequelize: Sequelize) => {
  CareerVerifyModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      careerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      certificateBucket: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      certificateKey: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      reviewedAt: {
        type: DataTypes.DATE,
        defaultValue: null,
      },
    },
    {
      sequelize,
      underscored: false,
      modelName: 'CareerVerify',
      tableName: 'careerVerify',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    }
  );

  CareerModel.hasOne(CareerVerifyModel, {
    foreignKey: 'careerId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  CareerVerifyModel.belongsTo(CareerModel, {
    foreignKey: 'careerId',
  });
};

export default CareerVerifyModel;
