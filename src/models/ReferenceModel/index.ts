import { Model, DataTypes, Sequelize } from 'sequelize';
import {
  IReferenceAttributes,
  IReferenceCreationAttributes,
  TReferenceType,
} from '@models/ReferenceModel/type';
import UserModel from '@models/UserModel';
import CorporateModel from '@models/CorporateModel';
import ReferenceDetailModel from '@models/ReferenceDetailModel';

class ReferenceModel
  extends Model<IReferenceAttributes, IReferenceCreationAttributes>
  implements IReferenceAttributes
{
  declare id: number;
  declare ownerId: number;
  declare targetId: number;
  declare writerId: number | null;
  declare corporateId: number;
  declare relationship: string;
  declare type: TReferenceType;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare readonly Corporate?: CorporateModel;
  declare readonly ReferenceDetails?: Array<ReferenceDetailModel>;

  declare static associations: {};
}

export const initReferenceModel = (sequelize: Sequelize) => {
  ReferenceModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      targetId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      writerId: {
        type: DataTypes.INTEGER,
        defaultValue: null,
      },
      corporateId: {
        type: DataTypes.INTEGER,
        defaultValue: false,
      },
      relationship: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('nomination', 'blind'),
        allowNull: false,
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
      modelName: 'Reference',
      tableName: 'Reference',
      paranoid: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    }
  );

  UserModel.hasMany(ReferenceModel, {
    foreignKey: 'ownerId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  ReferenceModel.belongsTo(UserModel, {
    foreignKey: 'ownerId',
  });

  UserModel.hasMany(ReferenceModel, {
    foreignKey: 'targetId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  ReferenceModel.belongsTo(UserModel, {
    foreignKey: 'targetId',
  });

  UserModel.hasMany(ReferenceModel, {
    foreignKey: 'writerId',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
  ReferenceModel.belongsTo(UserModel, {
    foreignKey: 'writerId',
  });

  CorporateModel.hasOne(ReferenceModel, {
    foreignKey: 'corporateId',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  });
  ReferenceModel.belongsTo(CorporateModel, {
    foreignKey: 'corporateId',
  });
};

export default ReferenceModel;
