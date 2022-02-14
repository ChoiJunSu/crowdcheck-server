export interface ISensSendMessageRequest {
  templateCode: string;
  messages: [
    {
      to: string;
      content: string;
    }
  ];
}

export interface ISensSendMessageResponse {
  ok: boolean;
  error: string;
}
