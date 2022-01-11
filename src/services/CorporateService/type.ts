import {
  IBaseServiceRequest,
  IBaseServiceResponse,
} from '@services/BaseService/type';

export interface ISearchRequest extends IBaseServiceRequest {
  word: string;
}

export interface ISearchResponse extends IBaseServiceResponse {
  corporates: Array<{
    id: number;
    name: string;
  }>;
}

export interface IAddRequest extends IBaseServiceRequest {
  name: string;
}

export interface IAddResponse extends IBaseServiceResponse {}
