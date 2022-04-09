import { AsyncRouter } from 'express-async-router';
import RequestService from '@services/RequestService';
import {
  IRequestAgreeRequest,
  IRequestGetAgreeCorporateRequest,
  IRequestDetailCorporateRequest,
  IRequestListCorporateRequest,
  IRequestListReceiverRequest,
  IRequestRegisterRequest,
  IRequestCloseRequest,
  IRequestListCandidateRequest,
  IRequestGetAgreeCandidateRequest,
  IRequestPayRequest,
} from '@services/RequestService/type';
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
    const { candidateName, candidatePhone } = req.body;

    return res.send(
      await RequestService.register({
        userId: req.user!.id,
        candidateName,
        candidatePhone,
      } as IRequestRegisterRequest)
    );
  }
);

RequestController.get(
  '/list/corporate',
  AuthMiddleware.isCorporate,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    return await RequestService.listCorporate({
      userId: req.user!.id,
    } as IRequestListCorporateRequest);
  }
);

RequestController.get(
  '/list/receiver',
  AuthMiddleware.isPersonal,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    return await RequestService.listReceiver({
      userId: req.user!.id,
    } as IRequestListReceiverRequest);
  }
);

RequestController.get(
  '/list/candidate',
  AuthMiddleware.isPersonal,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    return await RequestService.listCandidate({
      userId: req.user!.id,
    } as IRequestListCandidateRequest);
  }
);

RequestController.get(
  '/detail/corporate',
  AuthMiddleware.isCorporate,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { requestId } = req.query;

    return await RequestService.detailCorporate({
      requestId: parseInt(requestId as string),
      userId: req.user!.id,
    } as IRequestDetailCorporateRequest);
  }
);

RequestController.get(
  '/agree/corporate',
  AuthMiddleware.isCorporate,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { requestId } = req.query;

    return await RequestService.getAgreeCorporate({
      requestId: parseInt(requestId as string),
      userId: req.user!.id,
    } as IRequestGetAgreeCorporateRequest);
  }
);

RequestController.get(
  '/agree/candidate',
  AuthMiddleware.isPersonal,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { requestId } = req.query;

    return await RequestService.getAgreeCandidate({
      requestId: parseInt(requestId as string),
      userId: req.user!.id,
    } as IRequestGetAgreeCandidateRequest);
  }
);

RequestController.post(
  '/agree',
  AuthMiddleware.isPersonal,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { requestId, agrees } = req.body;

    return await RequestService.agree({
      userId: req.user!.id,
      requestId: parseInt(requestId),
      agrees,
    } as IRequestAgreeRequest);
  }
);

RequestController.get(
  '/pay',
  AuthMiddleware.isCorporate,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { requestId } = req.query;

    return await RequestService.pay({
      userId: req.user!.id,
      requestId: parseInt(requestId as string),
    } as IRequestPayRequest);
  }
);

RequestController.get(
  '/close',
  AuthMiddleware.isCorporate,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { requestId } = req.query;

    return res.send(
      await RequestService.close({
        userId: req.user!.id,
        requestId: parseInt(requestId as string),
      } as IRequestCloseRequest)
    );
  }
);

export default RequestController;
