export interface getEmailByOauthCodeRequestDto {
  provider: string;
  code: string;
  redirectUri: string;
}

export interface getEmailByOauthCodeResponseDto {
  ok: boolean;
  error: string;
  email: string;
}

export interface oauthLoginRequestDto {
  provider: string;
  code: string;
  redirectUri: string;
}

export interface oauthLoginResponseDto {
  ok: boolean;
  error: string;
  accessToken: any;
}
