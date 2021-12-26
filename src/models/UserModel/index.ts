import { Model, DataTypes } from 'sequelize';
import {
  IUserAttributes,
  IUserCreationAttributes,
} from '@models/UserModel/type';
import sequelize from '@models/BaseModel';

class UserModel
  extends Model<IUserAttributes, IUserCreationAttributes>
  implements IUserAttributes
{
  public email!: string;

  public static associations: {};
}

UserModel.init(
  {
    email: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    underscored: false,
    modelName: 'UserModel',
    tableName: 'user',
    paranoid: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  }
);

export default UserModel;
