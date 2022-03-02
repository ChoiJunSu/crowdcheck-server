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
  IRequestResumeListCorporateRequest,
  IRequestResumeListExpertRequest,
  IRequestResumeExploreRequest,
  IRequestResumeDetailExpertRequest,
  IRequestResumeGetAnswerExpertRequest,
  IRequestResumeAnswerRequest,
  IRequestResumeDetailCorporateRequest,
  IRequestResumeCloseRequest,
  IRequestResumeRewardRequest,
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

    return await RequestService.referenceAgree({
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

    return await RequestService.referenceVerify({
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

RequestController.post(
  '/resume/register',
  AuthMiddleware.isCorporate,
  MulterMiddleware.upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'portfolio', maxCount: 1 },
  ]),
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { memo, specialty, question, deadline, rewardNum, rewardAmount } =
      req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (!files['resume'][0])
      return res.send({ ok: false, error: '이력서를 업로드해주세요.' });

    return res.send(
      await RequestService.resumeRegister({
        userId: req.user!.id,
        memo,
        resume: files['resume'][0],
        portfolio: files['portfolio'][0] || null,
        specialty,
        question,
        deadline,
        rewardNum,
        rewardAmount,
      } as IRequestResumeRegisterRequest)
    );
  }
);

RequestController.get(
  '/resume/list/corporate',
  AuthMiddleware.isCorporate,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    return res.send(
      await RequestService.resumeListCorporate({
        userId: req.user!.id,
      } as IRequestResumeListCorporateRequest)
    );
  }
);

RequestController.get(
  '/resume/list/expert',
  AuthMiddleware.isExpert,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    return res.send(
      await RequestService.resumeListExpert({
        userId: req.user!.id,
      } as IRequestResumeListExpertRequest)
    );
  }
);

RequestController.get(
  '/resume/explore',
  AuthMiddleware.isExpert,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { page } = req.query;

    return res.send(
      await RequestService.resumeExplore({
        userId: req.user!.id,
        page: parseInt(page as string),
      } as IRequestResumeExploreRequest)
    );
  }
);

RequestController.get(
  '/resume/detail/corporate',
  AuthMiddleware.isCorporate,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { requestId } = req.query;

    return res.send(
      await RequestService.resumeDetailCorporate({
        userId: req.user!.id,
        requestId: parseInt(requestId as string),
      } as IRequestResumeDetailCorporateRequest)
    );
  }
);

RequestController.get(
  '/resume/detail/expert',
  AuthMiddleware.isExpert,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { requestId } = req.query;

    return res.send(
      await RequestService.resumeDetailExpert({
        userId: req.user!.id,
        requestId: parseInt(requestId as string),
      } as IRequestResumeDetailExpertRequest)
    );
  }
);

RequestController.get(
  '/resume/get/answer/expert',
  AuthMiddleware.isExpert,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { requestId } = req.query;

    return res.send(
      await RequestService.resumeGetAnswerExpert({
        userId: req.user!.id,
        requestId: parseInt(requestId as string),
      } as IRequestResumeGetAnswerExpertRequest)
    );
  }
);

RequestController.post(
  '/resume/answer',
  AuthMiddleware.isExpert,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const {
      requestId,
      workExperience,
      workExperienceDescription,
      roleFit,
      roleFitDescription,
      collaborationAbility,
      collaborationAbilityDescription,
      hardWorking,
      hardWorkingDescription,
      recommendedSalary,
    } = req.body;

    return res.send(
      await RequestService.resumeAnswer({
        userId: req.user!.id,
        requestId,
        workExperience,
        workExperienceDescription,
        roleFit,
        roleFitDescription,
        collaborationAbility,
        collaborationAbilityDescription,
        hardWorking,
        hardWorkingDescription,
        recommendedSalary,
      } as IRequestResumeAnswerRequest)
    );
  }
);

RequestController.get(
  '/resume/close',
  AuthMiddleware.isCorporate,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { requestId } = req.query;

    return res.send(
      await RequestService.resumeClose({
        userId: req.user!.id,
        requestId: parseInt(requestId as string),
      } as IRequestResumeCloseRequest)
    );
  }
);

RequestController.post(
  '/resume/reward',
  AuthMiddleware.isCorporate,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { requestId, receivers } = req.body;

    return res.send(
      await RequestService.resumeReward({
        userId: req.user!.id,
        requestId: parseInt(requestId as string),
        receivers: receivers.map((receiver: any) => ({
          id: parseInt(receiver.id as string),
        })),
      } as IRequestResumeRewardRequest)
    );
  }
);

export default RequestController;
