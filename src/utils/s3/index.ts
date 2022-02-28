import aws from 'aws-sdk';

export const S3Singleton = (function () {
  const client =
    process.env.NODE_ENV === 'development'
      ? new aws.S3({
          region: 'ap-northeast-2',
          credentials: new aws.SharedIniFileCredentials({
            profile: 'crowdcheck',
          }),
        })
      : new aws.S3({ region: 'ap-northeast-2' });

  return {
    getClient: function () {
      return client;
    },
    getSignedUrl: function (Bucket: string, Key: string) {
      return client.getSignedUrl('getObject', {
        Bucket,
        Key,
        Expires: 60 * 60,
      });
    },
  };
})();
