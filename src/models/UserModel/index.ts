import { Model, DataTypes, Sequelize } from 'sequelize';
import {
  IUserAttributes,
  IUserCreationAttributes,
  TUserType,
} from '@models/UserModel/type';
import CorporateModel from '@models/CorporateModel';
import { TOauthProvider } from '@controllers/AuthController/type';
import CareerModel from '@models/CareerModel';
import CandidateModel from '@models/CandidateModel';
import ReceiverModel from '@models/ReceiverModel';

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
  declare credit: number;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare readonly Corporate?: CorporateModel;
  declare readonly Candidate?: CandidateModel;
  declare readonly Careers?: Array<CareerModel>;
  declare readonly Receivers?: Array<ReceiverModel>;

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
        type: DataTypes.ENUM('personal', 'corporate', 'expert'),
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
      credit: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
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
      tableName: 'user',
      paranoid: false,
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
