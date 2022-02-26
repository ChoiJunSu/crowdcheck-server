import { Model, DataTypes, Sequelize } from 'sequelize';
import {
  IExpertVerifyAttributes,
  IExpertVerifyCreationAttributes,
} from '@models/ExpertVerifyModel/type';
import ExpertModel from '@models/ExpertModel';
import UserModel from '@models/UserModel';

class ExpertVerifyModel
  extends Model<IExpertVerifyAttributes, IExpertVerifyCreationAttributes>
  implements IExpertVerifyAttributes
{
  declare id: number;
  declare userId: number;
  declare certificateBucket: string;
  declare certificateKey: string;
  declare reviewedAt: Date | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare readonly Expert?: ExpertModel;

  declare static associations: {};
}

export const initExpertVerifyModel = (sequelize: Sequelize) => {
  ExpertVerifyModel.init(
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
      modelName: 'ExpertVerify',
      tableName: 'expertVerify',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    }
  );

  UserModel.hasOne(ExpertVerifyModel, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  ExpertVerifyModel.belongsTo(UserModel, {
    foreignKey: 'userId',
  });
};

export default ExpertVerifyModel;
