import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import createError from 'http-errors';
import { Error } from 'sequelize';
import sequelize from '@models/BaseModel';
import AuthController from '@controllers/AuthController';
import CorporateModel from '@models/CorporateModel';
import RequestModel from '@models/RequestModel';
import UserModel from '@models/UserModel';
import ReceiverModel from '@models/ReceiverModel';
import CareerModel from '@models/CareerModel';
import CandidateModel from '@models/CandidateModel';
import AgreeModel from '@models/AgreeModel';

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
    (async () => {
      await CorporateModel.create({ name: 'crowdcheck' });
      await UserModel.create({
        email: 'dev.crowdcheck@gmail.com',
        name: '크라우드체크',
        phone: '010020',
        type: 'personal',
        corporateId: 1,
      });
      await RequestModel.create({ corporateId: 1, question: 'dfad' });
      await ReceiverModel.create({ requestId: 1, userId: 1, answer: 'dasf' });
      await CareerModel.create({
        userId: 1,
        corporateId: 1,
        startAt: new Date(),
      });
      await CandidateModel.create({
        requestId: 1,
        name: '최준수',
        phone: '102',
      });
      await AgreeModel.create({
        requestId: 1,
        corporateId: 1,
        candidateId: 1,
        startAt: new Date(),
      });
    })();
  })
  .catch((e: Error) => {
    console.error(e);
  });

// body parser
app.use(express.json());

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
