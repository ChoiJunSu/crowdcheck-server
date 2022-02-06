import { Sequelize } from 'sequelize';
import {
  DB_HOST,
  DB_DATABASE,
  DB_PASSWORD,
  DB_USERNAME,
} from '@constants/secret';

const sequelize = new Sequelize(DB_DATABASE, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'mariadb',
});

export default sequelize;
