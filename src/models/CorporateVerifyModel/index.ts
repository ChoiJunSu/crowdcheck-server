import { Model, DataTypes } from 'sequelize';
import {
  ICorporateVerifyAttributes,
  ICorporateVerifyCreationAttributes,
} from '@models/CorporateVerifyModel/type';
import sequelize from '@models/BaseModel';
import UserModel from '@models/UserModel';
import CorporateModel from '@models/CorporateModel';

class CorporateVerifyModel
  extends Model<ICorporateVerifyAttributes, ICorporateVerifyCreationAttributes>
  implements ICorporateVerifyAttributes
{
  declare id: number;
  declare userId: number;
  declare registrationBucket: string;
  declare registrationKey: string;
  declare verifiedAt: Date | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare readonly Corporate?: CorporateModel;

  declare static associations: {};
}

CorporateVerifyModel.init(
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
    registrationBucket: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    registrationKey: {
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

UserModel.hasOne(CorporateVerifyModel, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
CorporateVerifyModel.belongsTo(UserModel, {
  foreignKey: 'userId',
});

export default CorporateVerifyModel;