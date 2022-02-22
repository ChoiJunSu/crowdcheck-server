export interface ISensSendMessageRequest {
  templateCode: string;
  messages: [
    {
      to: string;
      content: string;
      buttons?: [
        {
          type: string;
          name: string;
          linkMobile: string;
          linkPc: string;
        }
      ];
    }
  ];
}

export interface ISensSendMessageResponse {
  ok: boolean;
  error: string;
}
