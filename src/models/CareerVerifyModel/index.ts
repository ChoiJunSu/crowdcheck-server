import { Model, DataTypes } from 'sequelize';
import sequelize from '@models/BaseModel';
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
  declare verifiedAt: Date | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare static associations: {};
}

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
    verifiedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  },
  {
    sequelize,
    underscored: false,
    modelName: 'CorporateVerify',
    tableName: 'corporateVerify',
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

export default CareerVerifyModel;
