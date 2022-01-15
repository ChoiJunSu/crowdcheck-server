import { AsyncRouter } from 'express-async-router';
import RequestService from '@services/RequestService';
import {
  IRequestAgreeRequest,
  IRequestGetCandidateRequest,
  IRequestListCandidateRequest,
  IRequestRegisterRequest,
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

RequestController.get(
  '/candidate',
  AuthMiddleware.isCandidate,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { requestId } = req.query;

    return await RequestService.getCandidate({
      requestId,
      candidateId: req.user!.id,
    } as IRequestGetCandidateRequest);
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
      requestId,
      agree,
      agreeDescription,
    } as IRequestAgreeRequest);
  }
);

export default RequestController;
