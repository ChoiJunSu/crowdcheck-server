import { sign, verify } from 'jsonwebtoken';
import {
  IGenerateTokenRequest,
  IGenerateTokenResponse,
  IVerifyTokenRequest,
  IVerifyTokenResponse,
} from '@services/JwtService/type';

const JWT_SECRET = 'crowdcheck';
const JWT_EXPIRES_IN = '10s';
const JWT_ISSUER = 'crowdcheck';

class JwtService {
  static generateToken = async ({
    email,
  }: IGenerateTokenRequest): Promise<IGenerateTokenResponse> => {
    const response: IGenerateTokenResponse = {
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

  static verifyToken = async ({
    authToken,
  }: IVerifyTokenRequest): Promise<IVerifyTokenResponse> => {
    const response: IVerifyTokenResponse = {
      ok: false,
      error: '',
    };
    try {
      const decodedToken = await verify(authToken, JWT_SECRET);
      console.log(decodedToken);
      response.ok = true;
    } catch (error) {
      console.error(error);
      response.error = 'Token verification failed';
    }

    return response;
  };
}

export default JwtService;
