import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import createError from 'http-errors';
import { Error } from 'sequelize';
import sequelize from '@models/BaseModel';
import AuthMiddleware from '@middlewares/AuthMiddleware';
import AuthController from '@controllers/AuthController';

const app = express();
const port = 4000;
const WEB_URI = 'http://localhost:3000';

// CORS
app.use(cors({ origin: WEB_URI }));

// database
sequelize
  .authenticate()
  .then(() => {
    console.log('database connected');
  })
  .catch((e: Error) => {
    console.error(e);
  });
sequelize
  .sync({
    force: true,
  })
  .then(() => {
    console.log('database synchronized');
  })
  .catch((e: Error) => {
    console.error(e);
  });

// controllers
app.use('/auth', AuthController);

// error handling
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new createError.NotFound());
});
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err.stack);
  res.status(err.status || 500).send(err.message || 'Internal Server Error');
});

// server listen to port
app.listen(port, () => {
  console.log(`server start on port ${port}`);
});
