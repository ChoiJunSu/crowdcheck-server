import { AsyncRouter } from 'express-async-router';
import AuthMiddleware from '@middlewares/AuthMiddleware';
import {
  INextFunction,
  IRequest,
  IResponse,
} from '@controllers/BaseController/type';
import ReferenceService from '@services/ReferenceService';
import {
  IReferenceListCandidateRequest,
  IReferenceRemoveRequest,
} from '@services/ReferenceService/type';

const ReferenceController = AsyncRouter();

ReferenceController.get(
  '/list/candidate',
  AuthMiddleware.isPersonal,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    return await ReferenceService.listCandidate({
      userId: req.user!.id,
    } as IReferenceListCandidateRequest);
  }
);

ReferenceController.get(
  '/remove',
  AuthMiddleware.isPersonal,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { referenceId } = req.query;

    return await ReferenceService.remove({
      userId: req.user!.id,
      referenceId: parseInt(referenceId as string),
    } as IReferenceRemoveRequest);
  }
);

export default ReferenceController;
