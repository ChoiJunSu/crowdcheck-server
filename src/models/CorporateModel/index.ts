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
  declare id: number;
  declare name: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare static associations: {};
}

CorporateModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
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
