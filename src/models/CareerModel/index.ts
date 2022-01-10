import { Model, DataTypes } from 'sequelize';
import {
  ICareerAttributes,
  ICareerCreationAttributes,
} from '@models/CareerModel/type';
import sequelize from '@models/BaseModel';
import UserModel from '@models/UserModel';
import CorporateModel from '@models/CorporateModel';

class CareerModel
  extends Model<ICareerAttributes, ICareerCreationAttributes>
  implements ICareerAttributes
{
  declare id: number;
  declare userId: number;
  declare corporateId: number;
  declare department: string | null;
  declare startAt: Date;
  declare endAt: Date | null;
  declare verifiedAt: Date | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare static associations: {};
}

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
      defaultValue: null,
    },
    verifiedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  },
  {
    sequelize,
    underscored: false,
    modelName: 'CareerModel',
    tableName: 'career',
    paranoid: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  }
);

UserModel.hasOne(CareerModel, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
CareerModel.belongsTo(UserModel, {
  foreignKey: 'userId',
});

CorporateModel.hasOne(CareerModel, {
  foreignKey: 'corporateId',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});
CareerModel.belongsTo(CorporateModel, {
  foreignKey: 'corporateId',
});

export default CareerModel;