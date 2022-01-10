import { Sequelize } from 'sequelize';
import { DB_DATABASE, DB_PASSWORD, DB_USERNAME } from '@constants/secret';

const sequelize = new Sequelize(DB_DATABASE, DB_USERNAME, DB_PASSWORD, {
  dialect: 'mariadb',
});

export default sequelize;
