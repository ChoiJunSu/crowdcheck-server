import { decode, sign, verify } from 'jsonwebtoken';
import { SecretsManagerSingleton } from '@utils/secretesManager';

export const JwtSingleton = (() => {
  return {
    sign: (payload: any) => {
      return sign(payload, SecretsManagerSingleton.getSecrete('JWT_SECRET'), {
        issuer: 'crowdcheck',
        expiresIn: '1h',
      });
    },
    verify: (token: string) => {
      return verify(token, SecretsManagerSingleton.getSecrete('JWT_SECRET'));
    },
    decode: (token: string) => {
      return decode(token);
    },
  };
})();
