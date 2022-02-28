import aws from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { randomBytes } from 'crypto';
import { S3Singleton } from '@utils/s3';

export const MulterMiddleware = (() => {
  const client = S3Singleton.getClient();

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
