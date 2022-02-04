import twilio from 'twilio';
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
} from '@constants/secret';
import { ISendMessageRequest, ISendMessageResponse } from '@utils/twilio/type';

const messageClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export const sendMessage = async ({
  body,
  to,
}: ISendMessageRequest): Promise<ISendMessageResponse> => {
  const response: ISendMessageResponse = {
    ok: false,
    error: '',
  };

  try {
    const messageCreateResult = await messageClient.messages.create({
      body,
      from: TWILIO_PHONE_NUMBER,
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
};
