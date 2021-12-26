import {
  IBaseControllerRequest,
  IBaseControllerResponse,
} from '@controllers/BaseController/type';

export interface IGetLoginRequest extends IBaseControllerRequest {
  provider: string;
  code: string;
  redirectUri: string;
}

export interface IGetLoginResponse extends IBaseControllerResponse {
  token: string;
  email: string;
}
