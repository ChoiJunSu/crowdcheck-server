import { SecretsManagerSingleton } from '@utils/secretesManager';
import {
  ISensSendMessageRequest,
  ISensSendMessageResponse,
} from '@utils/sens/type';
import crypto from 'crypto';
import axios from 'axios';

export const SensSingleton = (() => {
  const client = {
    accessKeyId: '',
    secretKey: '',
    serviceId: '',
  };

  return {
    prepare: () => {
      client.accessKeyId =
        SecretsManagerSingleton.getSecrete('SENS_ACCESS_KEY_ID');
      client.secretKey = SecretsManagerSingleton.getSecrete('SENS_SECRET_KEY');
      client.serviceId = SecretsManagerSingleton.getSecrete('SENS_SERVICE_ID');
    },
    sendMessage: async ({
      templateCode,
      messages,
    }: ISensSendMessageRequest): Promise<ISensSendMessageResponse> => {
      const response: ISensSendMessageResponse = {
        ok: false,
        error: '',
      };

      try {
        const requestUrl = `/alimtalk/v2/services/${client.serviceId}/messages`;
        const timestamp = Date.now();
        const signature = crypto
          .createHmac('sha256', client.secretKey)
          .update(`POST ${requestUrl}\n${timestamp}\n${client.accessKeyId}`)
          .digest('base64');
        const sendMessageResponse = await axios.post(
          `https://sens.apigw.ntruss.com${requestUrl}`,
          { templateCode, plusFriendId: '@crowdcheck', messages },
          {
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'x-ncp-apigw-timestamp': timestamp.toString(),
              'x-ncp-iam-access-key': client.accessKeyId,
              'x-ncp-apigw-signature-v2': signature,
            },
          }
        );
        if (sendMessageResponse.status !== 202) {
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
