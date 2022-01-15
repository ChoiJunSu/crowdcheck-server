import { AsyncRouter } from 'express-async-router';
import {
  INextFunction,
  IRequest,
  IResponse,
} from '@controllers/BaseController/type';
import AuthMiddleware from '@middlewares/AuthMiddleware';
import RequestService from '@services/RequestService';
import {
  IRequestGetCandidateRequest,
  IRequestListCandidateRequest,
} from '@services/RequestService/type';

const CandidateController = AsyncRouter();

export default CandidateController;
