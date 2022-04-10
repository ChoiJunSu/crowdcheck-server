import {
  IBaseServiceRequest,
  IBaseServiceResponse,
} from '@services/BaseService/type';

export interface INodemailerSendMessageRequest extends IBaseServiceRequest {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface INodemailerSendMessageResponse extends IBaseServiceResponse {}
