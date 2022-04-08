import { WebClient } from '@slack/web-api';
import { SecretsManagerSingleton } from '@utils/secretesManager';

export const SlackSingleton = (() => {
  const client: WebClient = new WebClient();
  let token: string;

  return {
    prepare: async () => {
      try {
        token = SecretsManagerSingleton.getSecrete('SLACK_OAUTH_TOKEN');
        await client.auth.test({
          token,
        });
      } catch (e) {
        console.error(e);
      }
    },
    sendMessage: async (channel: string, text: string) => {
      try {
        await client.chat.postMessage({
          token,
          channel,
          attachments: [
            {
              fallback: text,
              author_name: process.env.NODE_ENV,
              color:
                process.env.NODE_ENV === 'development' ? '#6b7280' : '#2aa090',
              text,
            },
          ],
        });
      } catch (e) {
        console.error(e);
      }
    },
  };
})();
