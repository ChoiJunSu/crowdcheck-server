import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('crowdcheck', 'root', 'password', {
  dialect: 'mariadb',
});

export default sequelize;
