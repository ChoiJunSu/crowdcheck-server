import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import session from 'express-session';
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
import { NodemailerSingleton } from '@utils/nodemailer';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import AdminJSSequelize from '@adminjs/sequelize';

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

// body parser
app.use(express.json());

// elastic beanstalk health check
app.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.status(200).send();
});

(async () => {
  // prepare utils
  // secrets manager
  await SecretsManagerSingleton.prepare([
    'common/server',
    `${process.env.NODE_ENV}/db`,
  ]);
  // database
  await SequelizeSingleton.prepare();
  // sens
  SensSingleton.prepare();
  // cron
  CronSingleton.prepare();
  // nodemailer
  NodemailerSingleton.prepare();
  // slack
  await SlackSingleton.prepare();

  // adminJS
  app.use(
    session({ secret: SecretsManagerSingleton.getSecrete('SESSION_SECRET') })
  );
  AdminJS.registerAdapter(AdminJSSequelize);
  const adminJS = new AdminJS({
    databases: [SequelizeSingleton.getInstance()],
    rootPath: '/admin',
  });
  const adminJSRouter = AdminJSExpress.buildAuthenticatedRouter(adminJS, {
    authenticate: async (email, password) => {
      if (
        email !== SecretsManagerSingleton.getSecrete('ADMINJS_EMAIL') ||
        password !== SecretsManagerSingleton.getSecrete('ADMINJS_PASSWORD')
      )
        return false;
      return true;
    },
    cookiePassword: SecretsManagerSingleton.getSecrete(
      'ADMINJS_COOKIE_PASSWORD'
    ),
  });
  app.use(adminJS.options.rootPath, adminJSRouter);

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
})();
