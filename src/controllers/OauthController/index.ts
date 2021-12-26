import {
  AsyncRouter,
  Request,
  Response,
  NextFunction,
} from 'express-async-router';
import OauthService from '@services/OauthService';
import {
  IGetLoginRequest,
  IGetLoginResponse,
} from '@controllers/OauthController/type';

const OauthController = AsyncRouter();

OauthController.get(
  '/login',
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<IGetLoginResponse> => {
    const { provider, code, redirectUri } = req.query;
    return await OauthService.oauthLogin({
      provider,
      code,
      redirectUri,
    } as IGetLoginRequest);
  }
);

export default OauthController;
