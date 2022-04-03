export interface ISensSendMessageRequest {
  templateName: string;
  to: string;
  data?: object;
}

export interface ISensSendMessageResponse {
  ok: boolean;
  error: string;
}
