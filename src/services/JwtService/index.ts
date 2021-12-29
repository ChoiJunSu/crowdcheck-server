import { sign, verify } from 'jsonwebtoken';
import {
  IGenerateAuthTokenRequest,
  IGenerateAuthTokenResponse,
  IVerifyAuthTokenRequest,
  IVerifyAuthTokenResponse,
} from '@services/JwtService/type';

const JWT_SECRET = 'crowdcheck';
const JWT_EXPIRES_IN = '10s';
const JWT_ISSUER = 'crowdcheck';

class JwtService {
  static generateAuthToken = async ({
    email,
  }: IGenerateAuthTokenRequest): Promise<IGenerateAuthTokenResponse> => {
    const response: IGenerateAuthTokenResponse = {
      ok: false,
      error: '',
      authToken: '',
    };
    try {
      response.authToken = await sign({ email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        issuer: JWT_ISSUER,
      });
      response.ok = true;
    } catch (error) {
      console.error(error);
      response.error = 'Token sign failed';
    }

    return response;
  };

  static verifyAuthToken = async ({
    authToken,
  }: IVerifyAuthTokenRequest): Promise<IVerifyAuthTokenResponse> => {
    const response: IVerifyAuthTokenResponse = {
      ok: false,
      error: '',
    };
    try {
      const decodedAuthToken = await verify(authToken, JWT_SECRET);
      console.log(decodedAuthToken);
      response.ok = true;
    } catch (error) {
      console.error(error);
      response.error = 'Token verification failed';
    }

    return response;
  };
}

export default JwtService;
