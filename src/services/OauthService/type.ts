import {
  serviceRequestDto,
  serviceResponseDto,
} from '@services/BaseService/type';

export interface getEmailByOauthCodeRequestDto extends serviceRequestDto {
  provider: string;
  code: string;
  redirectUri: string;
}

export interface getEmailByOauthCodeResponseDto extends serviceResponseDto {
  email: string;
}

export interface oauthLoginRequestDto extends serviceRequestDto {
  provider: string;
  code: string;
  redirectUri: string;
}

export interface oauthLoginResponseDto extends serviceResponseDto {
  token: any;
}
