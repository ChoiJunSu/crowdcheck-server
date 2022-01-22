import aws from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { randomBytes } from 'crypto';
import { AWS_PROFILE, AWS_S3_BUCKET } from '@constants/aws';

// config aws
aws.config.update({ region: 'ap-northeast-2' });
aws.config.credentials = new aws.SharedIniFileCredentials({
  profile: AWS_PROFILE,
});

// config s3
const s3 = new aws.S3({ apiVersion: '2006-03-01' });

// config multer
export const upload = multer({
  storage: multerS3({
    s3,
    bucket: AWS_S3_BUCKET,
    key: (req, file, cb) => {
      cb(
        null,
        `${file.fieldname}/${randomBytes(20).toString(
          'hex'
        )}${file.originalname.substring(file.originalname.lastIndexOf('.'))}`
      );
    },
  }),
});
