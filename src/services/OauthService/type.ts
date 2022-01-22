import {
  IBaseServiceRequest,
  IBaseServiceResponse,
} from '@services/BaseService/type';
import { TOauthProvider } from '@controllers/AuthController/type';

export interface IGetEmailByOauthCodeRequest extends IBaseServiceRequest {
  provider: TOauthProvider;
  code: string;
  redirectUri: string;
}

export interface IGetEmailByOauthCodeResponse extends IBaseServiceResponse {
  email: string;
}
