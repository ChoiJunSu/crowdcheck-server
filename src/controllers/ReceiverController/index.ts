import { AsyncRouter } from 'express-async-router';
import AuthMiddleware from '@middlewares/AuthMiddleware';
import {
  INextFunction,
  IRequest,
  IResponse,
} from '@controllers/BaseController/type';
import ReceiverService from '@services/ReceiverService';
import {
  IReceiverAnswerRequest,
  IReceiverGetAnswerRequest,
  IReceiverRejectRequest,
  IReceiverVerifyRequest,
} from '@services/ReceiverService/type';

const ReceiverController = AsyncRouter();

ReceiverController.post(
  '/verify',
  AuthMiddleware.isPersonal,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { requestId, candidatePhone } = req.body;

    return await ReceiverService.verify({
      requestId: parseInt(requestId),
      userId: req.user!.id,
      candidatePhone,
    } as IReceiverVerifyRequest);
  }
);

ReceiverController.get(
  '/answer',
  AuthMiddleware.isPersonal,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { requestId } = req.query;

    return await ReceiverService.getAnswer({
      requestId: parseInt(requestId as string),
      userId: req.user!.id,
    } as IReceiverGetAnswerRequest);
  }
);

ReceiverController.post(
  '/answer',
  AuthMiddleware.isPersonal,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { requestId, type, relationship, details } = req.body;

    return await ReceiverService.answer({
      requestId: parseInt(requestId),
      userId: req.user!.id,
      type,
      relationship,
      details,
    } as IReceiverAnswerRequest);
  }
);

ReceiverController.get(
  '/reject',
  AuthMiddleware.isPersonal,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { requestId } = req.query;

    return await ReceiverService.reject({
      requestId: parseInt(requestId as string),
      userId: req.user!.id,
    } as IReceiverRejectRequest);
  }
);

export default ReceiverController;
