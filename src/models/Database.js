import { Sequelize } from "sequelize";
import UserModel from "./UserModel.js";

const sequelize = new Sequelize("crowdcheck", "root", "password", {
  dialect: "mariadb",
});

UserModel.init(sequelize);

const Database = {
  sequelize,
  UserModel,
};

UserModel.associate(Database);

export default Database;
