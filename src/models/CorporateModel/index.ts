import { Model, DataTypes, Sequelize } from 'sequelize';
import {
  ICorporateAttributes,
  ICorporateCreationAttributes,
} from '@models/CorporateModel/type';
import CareerModel from '@models/CareerModel';
import CandidateAgreeModel from '@models/CandidateAgreeModel';
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
  declare readonly CandidateAgrees?: Array<CandidateAgreeModel>;
  declare readonly Receivers?: Array<ReceiverModel>;
  declare readonly Request?: RequestModel;
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
    },
    {
      sequelize,
      underscored: false,
      modelName: 'Corporate',
      tableName: 'corporate',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    }
  );
};

export default CorporateModel;
