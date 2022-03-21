import { Model, DataTypes, Sequelize } from 'sequelize';
import {
  IPhoneVerifyVerifyAttributes,
  IPhoneVerifyVerifyCreationAttributes,
} from '@models/PhoneVerifyModel/type';
import UserModel from '@models/UserModel';

class PhoneVerifyVerifyModel
  extends Model<
    IPhoneVerifyVerifyAttributes,
    IPhoneVerifyVerifyCreationAttributes
  >
  implements IPhoneVerifyVerifyAttributes
{
  declare id: number;
  declare phone: string;
  declare code: number;
  declare verifiedAt: Date | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare static associations: {};
}

export const initPhoneVerifyModel = (sequelize: Sequelize) => {
  PhoneVerifyVerifyModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      modelName: 'PhoneVerify',
      tableName: 'phoneVerify',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    }
  );

  UserModel.hasOne(PhoneVerifyVerifyModel, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  PhoneVerifyVerifyModel.belongsTo(UserModel, {
    foreignKey: 'userId',
  });
};

export default PhoneVerifyVerifyModel;
