export interface getUserByEmailRequestDto {
  email: string;
}

export interface getUserByEmailResponseDto {
  ok: boolean;
  error: string;
  user: any;
}

export interface createUserRequestDto {
  email: string;
}

export interface createUserResponseDto {
  ok: boolean;
  error: string;
}
