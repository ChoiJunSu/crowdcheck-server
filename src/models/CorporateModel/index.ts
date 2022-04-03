import { Model, DataTypes, Sequelize } from 'sequelize';
import {
  ICorporateAttributes,
  ICorporateCreationAttributes,
} from '@models/CorporateModel/type';
import CareerModel from '@models/CareerModel';
import AgreeModel from '@models/AgreeModel';
import ReceiverModel from '@models/ReceiverModel';
import RequestModel from '@models/RequestModel';
import UserModel from '@models/UserModel';

class CorporateModel
  extends Model<ICorporateAttributes, ICorporateCreationAttributes>
  implements ICorporateAttributes
{
  declare id: number;
  declare name: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare readonly Careers?: Array<CareerModel>;
  declare readonly User?: UserModel;

  declare static associations: {};
}

export const initCorporateModel = (sequelize: Sequelize) => {
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
      modelName: 'Corporate',
      tableName: 'Corporate',
      paranoid: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
      indexes: [
        {
          unique: true,
          fields: ['name'],
        },
      ],
    }
  );
};

export default CorporateModel;
