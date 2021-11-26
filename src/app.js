import express from "express";
import createError from "http-errors";
import OauthController from "./controllers/oauth.js";

const app = express();
const port = 4000;

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
