import { Model, DataTypes, Sequelize } from 'sequelize';
import {
  ICareerAttributes,
  ICareerCreationAttributes,
} from '@models/CareerModel/type';
import UserModel from '@models/UserModel';
import CorporateModel from '@models/CorporateModel';
import AgreeModel from '@models/AgreeModel';

class CareerModel
  extends Model<ICareerAttributes, ICareerCreationAttributes>
  implements ICareerAttributes
{
  declare id: number;
  declare userId: number;
  declare corporateId: number;
  declare department: string | null;
  declare startAt: Date;
  declare endAt: Date;
  declare certificateBucket: string | null;
  declare certificateKey: string | null;
  declare verifiedAt: Date | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare readonly Agree?: AgreeModel;
  declare readonly Corporate?: CorporateModel;
  declare readonly User?: UserModel;

  declare static associations: {};
}

export const initCareerModel = (sequelize: Sequelize) => {
  CareerModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      corporateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      department: {
        type: DataTypes.STRING,
        defaultValue: null,
      },
      startAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      certificateBucket: {
        type: DataTypes.STRING,
        defaultValue: null,
      },
      certificateKey: {
        type: DataTypes.STRING,
        defaultValue: null,
      },
      verifiedAt: {
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
      modelName: 'Career',
      tableName: 'Career',
      paranoid: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    }
  );

  UserModel.hasMany(CareerModel, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  CareerModel.belongsTo(UserModel, {
    foreignKey: 'userId',
  });

  CorporateModel.hasMany(CareerModel, {
    foreignKey: 'corporateId',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  });
  CareerModel.belongsTo(CorporateModel, {
    foreignKey: 'corporateId',
  });
};

export default CareerModel;
