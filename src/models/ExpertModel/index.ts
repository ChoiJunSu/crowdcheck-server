import { Model, DataTypes, Sequelize } from 'sequelize';
import {
  IExpertAttributes,
  IExpertCreationAttributes,
  TExpertSpecialty,
} from '@models/ExpertModel/type';
import UserModel from '@models/UserModel';

class ExpertModel
  extends Model<IExpertAttributes, IExpertCreationAttributes>
  implements IExpertAttributes
{
  declare id: number;
  declare userId: number;
  declare specialty: TExpertSpecialty;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare static associations: {};
}

export const initExpertModel = (sequelize: Sequelize) => {
  ExpertModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      specialty: {
        type: DataTypes.ENUM('개발', '디자인', '기획', '마케팅'),
        allowNull: false,
      },
    },
    {
      sequelize,
      underscored: false,
      modelName: 'Expert',
      tableName: 'expert',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    }
  );

  UserModel.hasOne(ExpertModel, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  ExpertModel.belongsTo(UserModel, {
    foreignKey: 'userId',
  });
};

export default ExpertModel;
