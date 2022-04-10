import nodemailer from 'nodemailer';
import { SecretsManagerSingleton } from '@utils/secretesManager';
import {
  INodemailerSendMessageRequest,
  INodemailerSendMessageResponse,
} from '@utils/nodemailer/type';

export const NodemailerSingleton = (() => {
  let client: nodemailer.Transporter;

  return {
    prepare: () => {
      client = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'dev.crowdcheck@gmail.com',
          pass: SecretsManagerSingleton.getSecrete('NODEMAILER_PASSWORD'),
        },
      });
    },
    sendMessage: async ({
      to,
      subject,
      text,
      html,
    }: INodemailerSendMessageRequest): Promise<INodemailerSendMessageResponse> => {
      const response: INodemailerSendMessageResponse = {
        ok: false,
        error: '',
      };

      try {
        await client.sendMail({
          from: '크라우드체크 <dev.crowdcheck@gmail.com>',
          to,
          subject,
          text,
          html,
        });
        response.ok = true;
      } catch (e) {
        console.error(e);
        response.error = '이메일 발송에 실패했습니다.';
      }

      return response;
    },
  };
})();
