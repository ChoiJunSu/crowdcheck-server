import { AsyncRouter } from 'express-async-router';
import RequestService from '@services/RequestService';
import { IRequestRegisterRequest } from '@services/RequestService/type';
import AuthMiddleware from '@middlewares/AuthMiddleware';
import {
  INextFunction,
  IRequest,
  IResponse,
} from '@controllers/BaseController/type';

const RequestController = AsyncRouter();

RequestController.post(
  '/register',
  AuthMiddleware.isCorporate,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { name, phone, career, question, deadline } = req.body;

    return res.send(
      await RequestService.register({
        corporateId: req.user!.id,
        name,
        phone,
        career,
        question,
        deadline,
      } as IRequestRegisterRequest)
    );
  }
);

export default RequestController;
