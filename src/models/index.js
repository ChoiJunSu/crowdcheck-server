import { Sequelize } from "sequelize";
import UserModel from "./user.js";

const sequelize = new Sequelize("crowdcheck", "root", "password", {
  dialect: "mariadb",
});

UserModel.init(sequelize);

const database = {
  sequelize,
  UserModel,
};

UserModel.associate(database);

export default database;
