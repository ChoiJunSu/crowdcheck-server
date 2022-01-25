import {
  IBaseServiceRequest,
  IBaseServiceResponse,
} from '@services/BaseService/type';

export interface ICorporateSearchRequest extends IBaseServiceRequest {
  word: string;
}

export interface ICorporateSearchResponse extends IBaseServiceResponse {
  corporates: Array<{
    id: number;
    name: string;
  }>;
}
