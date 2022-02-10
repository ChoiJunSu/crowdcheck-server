import aws, { AWSError } from 'aws-sdk';
import { GetSecretValueResponse } from 'aws-sdk/clients/secretsmanager';

export const SecretsManagerSingleton = (function () {
  const client =
    process.env.NODE_ENV === 'development'
      ? new aws.SecretsManager({
          region: 'ap-northeast-2',
          credentials: new aws.SharedIniFileCredentials({
            profile: 'crowdcheck',
          }),
        })
      : new aws.SecretsManager({ region: 'ap-northeast-2' });

  let secrets: { [key: string]: string } = {};

  const callback = (err: AWSError, data: GetSecretValueResponse) => {
    if (err) throw err;
    else {
      if (!data.SecretString) return;
      const secret = JSON.parse(data.SecretString);
      secrets = { ...secrets, ...secret };
    }
  };

  return {
    prepare: async function (SecretIds: string[]) {
      await Promise.all(
        SecretIds.map(async (SecretId) => {
          await client.getSecretValue({ SecretId }, callback).promise();
        })
      );
    },
    getSecrete: function (SecretString: string) {
      return secrets[SecretString];
    },
  };
})();
