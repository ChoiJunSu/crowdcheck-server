import aws from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { randomBytes } from 'crypto';

export const MulterSingleton = (() => {
  const client = new aws.S3({
    region: 'ap-northeast-2',
    credentials: new aws.SharedIniFileCredentials({
      profile: 'crowdcheck',
    }),
  });

  return {
    upload: multer({
      storage: multerS3({
        s3: client,
        bucket: 'crowdcheck-upload',
        key: (req, file, cb) =>
          cb(
            null,
            `${file.fieldname}/${randomBytes(20).toString(
              'hex'
            )}${file.originalname.substring(
              file.originalname.lastIndexOf('.')
            )}`
          ),
      }),
    }),
  };
})();
