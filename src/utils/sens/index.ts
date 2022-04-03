import { SecretsManagerSingleton } from '@utils/secretesManager';
import {
  ISensSendMessageRequest,
  ISensSendMessageResponse,
} from '@utils/sens/type';
import crypto from 'crypto';
import axios from 'axios';

const templateNameMapper: { [name: string]: string } = {
  agree: 'agree4',
  receive: 'receive3',
  answer: 'answer3',
  verifyCode: 'verifyCode',
  candidate: 'candidate',
};

const templateContentMapper = (
  code: string,
  data?: any
):
  | {
      content: string;
      buttons?: Array<{
        type: string;
        name: string;
        linkMobile: string;
        linkPc: string;
      }>;
    }
  | undefined => {
  switch (code) {
    case 'agree4': {
      return {
        content: `평판 조회 동의 요청이 도착하였습니다.\n아래 버튼으로 접속하여 로그인 후 동의를 완료해주세요.`,
        buttons: [
          {
            type: 'WL',
            name: '동의하러 가기',
            linkMobile: 'https://crowdcheck.io',
            linkPc: 'https://crowdcheck.io',
          },
        ],
      };
    }
    case 'receive3': {
      return {
        content: `새로운 의뢰가 도착하였습니다.\n아래 버튼으로 접속하여 로그인 후 답변해주세요.\n\n(해당 의뢰 알림 메시지는 회원님의 알림 신청에 의해 발송됩니다.)`,
        buttons: [
          {
            type: 'WL',
            name: '답변하러 가기',
            linkMobile: 'https://crowdcheck.io',
            linkPc: 'https://crowdcheck.io',
          },
        ],
      };
    }
    case 'answer3': {
      return {
        content: `새로운 답변이 등록되었습니다.\n아래 버튼으로 접속하여 로그인 후 확인해주세요.\n\n(해당 답변 알림 메시지는 회원님의 알림 신청에 의해 발송됩니다.)`,
        buttons: [
          {
            type: 'WL',
            name: '확인하러 가기',
            linkMobile: 'https://crowdcheck.io',
            linkPc: 'https://crowdcheck.io',
          },
        ],
      };
    }
    case 'verifyCode': {
      return {
        content: `인증번호는 ${data.code} 입니다.`,
      };
    }
    case 'candidate': {
      return {
        content: `평판 조회 동의 요청이 도착하였습니다.\n아래 버튼으로 접속하여 가이드를 확인해주세요.`,
        buttons: [
          {
            type: 'WL',
            name: '가이드 확인하기',
            linkMobile: 'https://crowdcheck.io/guide/candidate',
            linkPc: 'https://crowdcheck.io/guide/candidate',
          },
        ],
      };
    }
  }
};

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
      templateName,
      to,
      data,
    }: ISensSendMessageRequest): Promise<ISensSendMessageResponse> => {
      const response: ISensSendMessageResponse = {
        ok: false,
        error: '',
      };

      try {
        // send alimtalk
        const requestUrl = `/alimtalk/v2/services/${client.serviceId}/messages`;
        const timestamp = Date.now();
        const signature = crypto
          .createHmac('sha256', client.secretKey)
          .update(`POST ${requestUrl}\n${timestamp}\n${client.accessKeyId}`)
          .digest('base64');
        const templateCode = templateNameMapper[templateName];
        const content = templateContentMapper(templateCode, data);
        if (!content) {
          response.error = '메시지 템플릿이 올바르지 않습니다.';
          return response;
        }
        let messageContent = content.content;
        if (content.buttons) {
          messageContent = messageContent.replace('버튼으로', '주소로');
          messageContent += `\n${content.buttons[0].linkMobile}`;
        }
        let sendMessageResponse = await axios.post(
          `https://sens.apigw.ntruss.com${requestUrl}`,
          {
            templateCode,
            plusFriendId: '@crowdcheck',
            messages: [
              {
                to,
                ...content,
                failoverConfig: {
                  from: '07042830275',
                  subject: '[크라우드체크]',
                  content: messageContent,
                },
              },
            ],
          },
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
          response.error = '메시지 전송에 실패했습니다.';
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
