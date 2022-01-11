import {
  AsyncRouter,
  Request,
  Response,
  NextFunction,
} from 'express-async-router';
import CorporateService from '@services/CorporateService';
import { IAddRequest, ISearchRequest } from '@services/CorporateService/type';

const CorporateController = AsyncRouter();

CorporateController.post(
  '/search',
  async (req: Request, res: Response, next: NextFunction) => {
    const { word } = req.body;

    return res.send(
      await CorporateService.search({
        word,
      } as ISearchRequest)
    );
  }
);

CorporateController.post(
  '/add',
  async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body;

    return res.send(await CorporateService.add({ name } as IAddRequest));
  }
);

export default CorporateController;
