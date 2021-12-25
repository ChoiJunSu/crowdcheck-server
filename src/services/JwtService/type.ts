import {
  serviceRequestDto,
  serviceResponseDto,
} from '@services/BaseService/type';

export interface generateTokenRequestDto extends serviceRequestDto {
  email: string;
}

export interface generateTokenResponseDto extends serviceResponseDto {
  token: any;
}

export interface verifyTokenRequestDto extends serviceRequestDto {
  token: any;
}

export interface verifyTokenResponseDto extends serviceResponseDto {}
