import { Model, DataTypes, Sequelize } from 'sequelize';
import {
  IAgreeAttributes,
  IAgreeCreationAttributes,
} from '@models/AgreeModel/type';
import RequestModel from '@models/RequestModel';
import CareerModel from '@models/CareerModel';
import CorporateModel from '@models/CorporateModel';

class AgreeModel
  extends Model<IAgreeAttributes, IAgreeCreationAttributes>
  implements IAgreeAttributes
{
  declare id: number;
  declare requestId: number;
  declare careerId: number;
  declare corporateId: number;
  declare disagreeReason: string | null;
  declare agreedAt: Date | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare readonly Career?: CareerModel;
  declare readonly Corporate?: CorporateModel;

  declare static associations: {};
}

export const initAgreeModel = (sequelize: Sequelize) => {
  AgreeModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      requestId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      careerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      corporateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      disagreeReason: {
        type: DataTypes.STRING,
        defaultValue: null,
      },
      agreedAt: {
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
      modelName: 'Agree',
      tableName: 'Agree',
      paranoid: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    }
  );

  RequestModel.hasMany(AgreeModel, {
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  AgreeModel.belongsTo(RequestModel, {
    foreignKey: 'requestId',
  });

  CareerModel.hasOne(AgreeModel, {
    foreignKey: 'careerId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  AgreeModel.belongsTo(CareerModel, {
    foreignKey: 'careerId',
  });

  CorporateModel.hasOne(AgreeModel, {
    foreignKey: 'corporateId',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  });
  AgreeModel.belongsTo(CorporateModel, {
    foreignKey: 'corporateId',
  });
};

export default AgreeModel;
