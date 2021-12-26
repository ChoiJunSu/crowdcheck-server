import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import createError from 'http-errors';
import { Error } from 'sequelize';
import OauthController from '@controllers/OauthController';
import sequelize from '@models/BaseModel';

const index = express();
const port = 4000;
const WEB_URI = 'http://localhost:3000';

// CORS
index.use(cors({ origin: WEB_URI }));

// database
sequelize
  .authenticate()
  .then(() => {
    console.log('database connected');
  })
  .catch((error: Error) => {
    console.error(error);
  });
sequelize
  .sync({
    force: true,
  })
  .then(() => {
    console.log('database synchronized');
  })
  .catch((error: Error) => {
    console.error(error);
  });

// controllers
index.use('/oauth', OauthController);

// error handling
index.use((req: Request, res: Response, next: NextFunction) => {
  next(new createError.NotFound());
});
index.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err.stack);
  res.status(err.status || 500).send(err.message || 'Internal Server Error');
});

// server listen to port
index.listen(port, () => {
  console.log(`server start on port ${port}`);
});
