import { sign, verify } from 'jsonwebtoken';
import {
  IGenerateTokenRequest,
  IGenerateTokenResponse,
  IVerifyTokenRequest,
  IVerifyTokenResponse,
} from '@services/JwtService/type';

const JWT_SECRET = 'crowdcheck';
const JWT_EXPIRES_IN = '1h';
const JWT_ISSUER = 'crowdcheck';

class JwtService {
  static generateToken = ({
    email,
  }: IGenerateTokenRequest): IGenerateTokenResponse => {
    const response: IGenerateTokenResponse = {
      ok: false,
      error: '',
      token: null,
    };
    try {
      response.token = sign({ email }, JWT_SECRET, {
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

  static verifyToken = ({
    token,
  }: IVerifyTokenRequest): IVerifyTokenResponse => {
    const response: IVerifyTokenResponse = {
      ok: false,
      error: '',
    };
    try {
      const decodedToken = verify(token, JWT_SECRET);
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
