import express from "express";
import createError from "http-errors";

const app = express();
const port = 3000;

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
