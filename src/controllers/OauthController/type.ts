import {
  controllerRequestDto,
  controllerResponseDto,
} from '@controllers/BaseController/type';

export interface getLoginRequestDto extends controllerRequestDto {
  provider: string;
  code: string;
  redirectUri: string;
}

export interface getLoginResponseDto extends controllerResponseDto {
  token: any;
}
