export interface ITwilioSendMessageRequest {
  body: string;
  to: string;
}

export interface ITwilioSendMessageResponse {
  ok: boolean;
  error: string;
}
