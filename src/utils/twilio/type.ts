export interface ISendMessageRequest {
  body: string;
  to: string;
}

export interface ISendMessageResponse {
  ok: boolean;
  error: string;
}
