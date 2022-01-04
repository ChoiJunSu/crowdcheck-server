import { Model, DataTypes } from 'sequelize';
import {
  ICorporateAttributes,
  ICorporateCreationAttributes,
} from '@models/CorporateModel/type';
import sequelize from '@models/BaseModel';

class CorporateModel
  extends Model<ICorporateAttributes, ICorporateCreationAttributes>
  implements ICorporateAttributes
{
  public name!: string;
  public phone!: string;
  public email!: string;
  public hashed!: string;

  public static associations: {};
}

CorporateModel.init(
  {
    name: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING(40),
    },
    email: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: true,
    },
    hashed: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    underscored: false,
    modelName: 'CorporateModel',
    tableName: 'corporate',
    paranoid: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  }
);

export default CorporateModel;
