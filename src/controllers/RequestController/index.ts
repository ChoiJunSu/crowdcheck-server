import { AsyncRouter } from 'express-async-router';
import RequestService from '@services/RequestService';
import {
  IRequestAgreeRequest,
  IRequestAnswerRequest,
  IRequestGetCandidateRequest,
  IRequestGetCorporateRequest,
  IRequestGetReceiverRequest,
  IRequestListCandidateRequest,
  IRequestListCorporateRequest,
  IRequestListReceiverRequest,
  IRequestRegisterRequest,
  IRequestVerifyRequest,
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
    const { name, phone, career, question, deadline } = req.body;

    return res.send(
      await RequestService.register({
        userId: req.user!.id,
        name,
        phone,
        career,
        question,
        deadline,
      } as IRequestRegisterRequest)
    );
  }
);

RequestController.get(
  '/get/receiver',
  AuthMiddleware.isPersonal,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { requestId } = req.query;

    return await RequestService.getReceiver({
      requestId: parseInt(requestId as string),
      userId: req.user!.id,
    } as IRequestGetReceiverRequest);
  }
);

RequestController.get(
  '/get/corporate',
  AuthMiddleware.isCorporate,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { requestId } = req.query;

    return await RequestService.getCorporate({
      requestId: parseInt(requestId as string),
      userId: req.user!.id,
    } as IRequestGetCorporateRequest);
  }
);

RequestController.get(
  '/get/candidate',
  AuthMiddleware.isCandidate,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { requestId } = req.query;

    return await RequestService.getCandidate({
      requestId: parseInt(requestId as string),
      candidateId: req.user!.id,
    } as IRequestGetCandidateRequest);
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
  '/list/corporate',
  AuthMiddleware.isCorporate,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    return await RequestService.listCorporate({
      userId: req.user!.id,
    } as IRequestListCorporateRequest);
  }
);

RequestController.get(
  '/list/candidate',
  AuthMiddleware.isCandidate,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    return await RequestService.listCandidate({
      candidateId: req.user!.id,
    } as IRequestListCandidateRequest);
  }
);

RequestController.post(
  '/agree',
  AuthMiddleware.isCandidate,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { requestId, agree, agreeDescription } = req.body;

    return await RequestService.agree({
      candidateId: req.user!.id,
      requestId: parseInt(requestId),
      agree,
      agreeDescription,
    } as IRequestAgreeRequest);
  }
);

RequestController.post(
  '/verify',
  AuthMiddleware.isPersonal,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { requestId, candidatePhone } = req.body;

    return await RequestService.verify({
      requestId: parseInt(requestId),
      userId: req.user!.id,
      candidatePhone,
    } as IRequestVerifyRequest);
  }
);

RequestController.post(
  '/answer',
  AuthMiddleware.isPersonal,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { requestId, answer } = req.body;

    return await RequestService.answer({
      requestId: parseInt(requestId),
      userId: req.user!.id,
      answer,
    } as IRequestAnswerRequest);
  }
);

RequestController.get(
  '/reject',
  AuthMiddleware.isPersonal,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { requestId } = req.query;

    return await RequestService.reject({
      requestId: parseInt(requestId as string),
      userId: req.user!.id,
    } as IRequestAnswerRequest);
  }
);

export default RequestController;
