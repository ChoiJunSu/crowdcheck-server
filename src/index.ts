import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import createError from 'http-errors';
import AuthController from '@controllers/AuthController';
import CorporateController from '@controllers/CorporateController';
import RequestController from '@controllers/RequestController';
import UserController from '@controllers/UserController';
import { SecretsManagerSingleton } from '@utils/secretesManager';
import { SequelizeSingleton } from '@utils/sequelize';
import { SensSingleton } from '@utils/sens';
import ReceiverController from '@controllers/ReceiverController';
import ReferenceController from '@controllers/ReferenceController';
import { CronSingleton } from '@utils/cron';
import { SlackSingleton } from '@utils/slack';

const app = express();
const port = 4000;

// env
dotenv.config({
  path: path.join(__dirname, '../', `.env.${process.env.NODE_ENV}`),
});

// CORS
const corsHandler = cors({ origin: process.env.WEB_URL });
app.options('*', corsHandler);
app.use(corsHandler);

// secrete manager
SecretsManagerSingleton.prepare([
  'common/server',
  `${process.env.NODE_ENV}/db`,
]).then(async () => {
  // database
  SequelizeSingleton.prepare();

  // sens
  SensSingleton.prepare();

  // cron
  CronSingleton.prepare();

  // slack
  await SlackSingleton.prepare();
});

// body parser
app.use(express.json());

// elastic beanstalk health check
app.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.status(200).send();
});

// controllers
app.use('/auth', AuthController);
app.use('/corporate', CorporateController);
app.use('/receiver', ReceiverController);
app.use('/reference', ReferenceController);
app.use('/request', RequestController);
app.use('/user', UserController);

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
