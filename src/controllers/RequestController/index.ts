import { AsyncRouter } from 'express-async-router';
import RequestService from '@services/RequestService';
import {
  IRequestReferenceAgreeRequest,
  IRequestReferenceAnswerRequest,
  IRequestReferenceGetCandidateRequest,
  IRequestReferenceGetCorporateAgreeRequest,
  IRequestReferenceGetCorporateRequest,
  IRequestReferenceGetReceiverRequest,
  IRequestReferenceListCandidateRequest,
  IRequestReferenceListCorporateRequest,
  IRequestReferenceListReceiverRequest,
  IRequestReferenceRegisterRequest,
  IRequestResumeRegisterRequest,
  IRequestReferenceVerifyRequest,
} from '@services/RequestService/type';
import AuthMiddleware from '@middlewares/AuthMiddleware';
import {
  INextFunction,
  IRequest,
  IResponse,
} from '@controllers/BaseController/type';
import { MulterMiddleware } from '@middlewares/MultureMiddleware';

const RequestController = AsyncRouter();

RequestController.post(
  '/reference/register',
  AuthMiddleware.isCorporate,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { name, phone, careers, question, deadline } = req.body;

    return res.send(
      await RequestService.referenceRegister({
        userId: req.user!.id,
        name,
        phone,
        careers,
        question,
        deadline,
      } as IRequestReferenceRegisterRequest)
    );
  }
);

RequestController.post(
  '/resume/register',
  AuthMiddleware.isCorporate,
  MulterMiddleware.upload.single('resume'),
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { memo, question, deadline } = req.body;
    if (!req.file)
      return res.send({ ok: false, error: '이력서를 업로드해주세요.' });

    return res.send(
      await RequestService.resumeRegister({
        userId: req.user!.id,
        memo,
        resume: req.file,
        question,
        deadline,
      } as IRequestResumeRegisterRequest)
    );
  }
);

RequestController.get(
  '/reference/get/receiver',
  AuthMiddleware.isPersonal,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { requestId } = req.query;

    return await RequestService.referenceGetReceiver({
      requestId: parseInt(requestId as string),
      userId: req.user!.id,
    } as IRequestReferenceGetReceiverRequest);
  }
);

RequestController.get(
  '/reference/get/corporate',
  AuthMiddleware.isCorporate,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { requestId } = req.query;

    return await RequestService.referenceGetCorporate({
      requestId: parseInt(requestId as string),
      userId: req.user!.id,
    } as IRequestReferenceGetCorporateRequest);
  }
);

RequestController.get(
  '/reference/get/corporate/agree',
  AuthMiddleware.isCorporate,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { requestId } = req.query;

    return await RequestService.referenceGetCorporateAgree({
      requestId: parseInt(requestId as string),
      userId: req.user!.id,
    } as IRequestReferenceGetCorporateAgreeRequest);
  }
);

RequestController.get(
  '/reference/get/candidate',
  AuthMiddleware.isCandidate,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { requestId } = req.query;

    return await RequestService.referenceGetCandidate({
      requestId: parseInt(requestId as string),
      candidateId: req.user!.id,
    } as IRequestReferenceGetCandidateRequest);
  }
);

RequestController.get(
  '/reference/list/receiver',
  AuthMiddleware.isPersonal,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    return await RequestService.referenceListReceiver({
      userId: req.user!.id,
    } as IRequestReferenceListReceiverRequest);
  }
);

RequestController.get(
  '/reference/list/corporate',
  AuthMiddleware.isCorporate,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    return await RequestService.referenceListCorporate({
      userId: req.user!.id,
    } as IRequestReferenceListCorporateRequest);
  }
);

RequestController.get(
  '/reference/list/candidate',
  AuthMiddleware.isCandidate,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    return await RequestService.referenceListCandidate({
      candidateId: req.user!.id,
    } as IRequestReferenceListCandidateRequest);
  }
);

RequestController.post(
  '/reference/agree',
  AuthMiddleware.isCandidate,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { requestId, agrees, agreeDescription } = req.body;

    return await RequestService.agree({
      candidateId: req.user!.id,
      requestId: parseInt(requestId),
      agrees,
      agreeDescription,
    } as IRequestReferenceAgreeRequest);
  }
);

RequestController.post(
  '/reference/verify',
  AuthMiddleware.isPersonal,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { requestId, candidatePhone } = req.body;

    return await RequestService.verify({
      requestId: parseInt(requestId),
      userId: req.user!.id,
      candidatePhone,
    } as IRequestReferenceVerifyRequest);
  }
);

RequestController.post(
  '/reference/answer',
  AuthMiddleware.isPersonal,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { requestId, answer } = req.body;

    return await RequestService.referenceAnswer({
      requestId: parseInt(requestId),
      userId: req.user!.id,
      answer,
    } as IRequestReferenceAnswerRequest);
  }
);

RequestController.get(
  '/reference/reject',
  AuthMiddleware.isPersonal,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { requestId } = req.query;

    return await RequestService.referenceReject({
      requestId: parseInt(requestId as string),
      userId: req.user!.id,
    } as IRequestReferenceAnswerRequest);
  }
);

export default RequestController;
