import { Model, DataTypes, Sequelize } from 'sequelize';
import {
  IUserAttributes,
  IUserCreationAttributes,
  TOauthProvider,
  TUserType,
} from '@models/UserModel/type';
import CorporateModel from '@models/CorporateModel';
import CareerModel from '@models/CareerModel';

class UserModel
  extends Model<IUserAttributes, IUserCreationAttributes>
  implements IUserAttributes
{
  declare id: number;
  declare email: string;
  declare hashed: string | null;
  declare name: string;
  declare phone: string;
  declare type: TUserType;
  declare oauthProvider: TOauthProvider | null;
  declare corporateId: number | null;
  declare certificateBucket: string | null;
  declare certificateKey: string | null;
  declare verifiedAt: Date | null;
  declare loginAt: Date | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare readonly Corporate?: CorporateModel;
  declare readonly Careers?: Array<CareerModel>;

  declare static associations: {};
}

export const initUserModel = (sequelize: Sequelize) => {
  UserModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      hashed: {
        type: DataTypes.STRING,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('personal', 'corporate'),
        allowNull: false,
      },
      oauthProvider: {
        type: DataTypes.ENUM('google', 'kakao'),
        defaultValue: null,
      },
      corporateId: {
        type: DataTypes.INTEGER,
        unique: true,
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
      loginAt: {
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
      modelName: 'User',
      tableName: 'User',
      paranoid: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    }
  );

  CorporateModel.hasOne(UserModel, {
    foreignKey: 'corporateId',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  });
  UserModel.belongsTo(CorporateModel, {
    foreignKey: 'corporateId',
  });
};

export default UserModel;
