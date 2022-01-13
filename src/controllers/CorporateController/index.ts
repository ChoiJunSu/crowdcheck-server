import { AsyncRouter } from 'express-async-router';
import CorporateService from '@services/CorporateService';
import {
  ICorporateAddRequest,
  ICorporateSearchRequest,
} from '@services/CorporateService/type';
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

CorporateController.post(
  '/add',
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { name } = req.body;

    return res.send(
      await CorporateService.add({ name } as ICorporateAddRequest)
    );
  }
);

export default CorporateController;
