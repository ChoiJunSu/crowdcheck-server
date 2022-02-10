import twilio from 'twilio';
import { ISendMessageRequest, ISendMessageResponse } from '@utils/twilio/type';
import { SecretsManagerSingleton } from '@utils/secretesManager';

export const TwilioSingleton = (() => {
  let client: twilio.Twilio;

  return {
    prepare: () => {
      console.log(SecretsManagerSingleton.getSecrete('TWILIO_ACCOUNT_SID'));
      client = twilio(
        SecretsManagerSingleton.getSecrete('TWILIO_ACCOUNT_SID'),
        SecretsManagerSingleton.getSecrete('TWILIO_AUTH_TOKEN')
      );
    },
    sendMessage: async ({
      body,
      to,
    }: ISendMessageRequest): Promise<ISendMessageResponse> => {
      const response: ISendMessageResponse = {
        ok: false,
        error: '',
      };

      try {
        const messageCreateResult = await client.messages.create({
          body: `[크라우드체크] ${body}`,
          from: '+19034965728',
          to: `+82${parseInt(to, 10)}`,
        });
        if (!messageCreateResult) {
          response.error = '메세지 전송 오류입니다.';
          return response;
        }
        response.ok = true;
      } catch (e) {
        console.error(e);
        response.error = '메세지 전송에 실패했습니다.';
      }

      return response;
    },
  };
})();
