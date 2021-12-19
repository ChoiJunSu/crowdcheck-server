export interface getLoginRequestDto {
  provider: string;
  code: string;
  redirectUri: string;
}

export interface getLoginResponseDto {
  ok: boolean;
  error: string;
  accessToken: any;
}
