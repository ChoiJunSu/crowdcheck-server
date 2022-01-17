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
import CandidateAgreeModel from '@models/CandidateAgreeModel';
import CorporateController from '@controllers/CorporateController';
import RequestController from '@controllers/RequestController';
import { WEB_URL } from '@constants/url';
import { MAX_TIMESTAMP } from '@constants/date';

const app = express();
const port = 4000;

// CORS
app.use(cors({ origin: WEB_URL }));

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
    force: false,
  })
  .then(() => {
    console.log('database synchronized');
    (async () => {
      await CorporateModel.create({ name: 'crowdcheck' });
      await UserModel.create({
        email: 'dev.crowdcheck@gmail.com',
        name: '크라우드체크',
        phone: '010020',
        type: 'corporate',
        corporateId: 1,
      });
      await RequestModel.create({
        corporateId: 1,
        question: 'dfad',
        deadline: new Date(MAX_TIMESTAMP),
      });
      await ReceiverModel.create({ requestId: 1, userId: 1, answer: 'dasf' });
      await CareerModel.create({
        userId: 1,
        corporateId: 1,
        startAt: new Date(),
        endAt: new Date(MAX_TIMESTAMP),
      });
      await CandidateModel.create({
        requestId: 1,
        name: '최준수',
        phone: '102',
        code: 'asdfgqwert',
      });
      await CandidateAgreeModel.create({
        requestId: 1,
        corporateId: 1,
        candidateId: 1,
        startAt: new Date(),
        endAt: new Date(MAX_TIMESTAMP),
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
app.use('/corporate', CorporateController);
app.use('/request', RequestController);

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
