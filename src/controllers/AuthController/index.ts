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
} from '@controllers/AuthController/type';

const AuthController = AsyncRouter();

AuthController.get(
  '/oauthLogin',
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

AuthController.get(
  '/renewAuthToken',
  async (req: Request, res: Response, next: NextFunction) => {
    console.log('renew auth token', req.headers);
  }
);

export default AuthController;
