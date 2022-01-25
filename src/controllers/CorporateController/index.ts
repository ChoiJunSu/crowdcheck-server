import { AsyncRouter } from 'express-async-router';
import CorporateService from '@services/CorporateService';
import { ICorporateSearchRequest } from '@services/CorporateService/type';
import {
  INextFunction,
  IRequest,
  IResponse,
} from '@controllers/BaseController/type';

const CorporateController = AsyncRouter();

CorporateController.post(
  '/search',
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { word } = req.body;

    return res.send(
      await CorporateService.search({
        word,
      } as ICorporateSearchRequest)
    );
  }
);

export default CorporateController;
