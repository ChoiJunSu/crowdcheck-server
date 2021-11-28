import express from "express";
import cors from "cors";
import database from "./models/Database.js";
import createError from "http-errors";
import OauthController from "./controllers/OauthController.js";

const app = express();
const port = 4000;
const WEB_URI = "http://localhost:3000";

// CORS
app.use(cors({ origin: WEB_URI }));

// database
const { sequelize } = database;
sequelize
  .authenticate()
  .then(() => {
    console.log("database connected");
  })
  .catch((error) => {
    console.error(error);
  });
sequelize
  .sync({
    force: true,
  })
  .then(() => {
    console.log("database synchronized");
  })
  .catch((error) => {
    console.error(error);
  });

// controllers
app.use("/oauth", OauthController);

// error handling
app.use((req, res, next) => {
  next(createError.NotFound());
});
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(err.status || 500).send(err.message || "Internal Server Error");
});

// server listen to port
app.listen(port, () => {
  console.log(`server start on port ${port}`);
});
