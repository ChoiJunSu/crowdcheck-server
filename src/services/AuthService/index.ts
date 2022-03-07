import {
  IAuthTokenPayload,
  IAuthRegisterCorporateRequest,
  IAuthRegisterCorporateResponse,
  IAuthLoginOauthRequest,
  IAuthLoginOauthResponse,
  IAuthTokenRenewRequest,
  IAuthTokenRenewResponse,
  IAuthLoginRequest,
  IAuthLoginResponse,
  IAuthRegisterPersonalRequest,
  IAuthRegisterPersonalResponse,
  IAuthLoginCandidateRequest,
  IAuthLoginCandidateResponse,
  IAuthRegisterOauthPersonalRequest,
  IAuthRegisterOauthPersonalResponse,
  IRegisterTokenPayload,
  IAuthPhoneSendRequest,
  IAuthPhoneSendResponse,
  IAuthPhoneVerifyRequest,
  IAuthPhoneVerifyResponse,
  IAuthRegisterExpertRequest,
  IAuthRegisterExpertResponse,
  IAuthWithdrawRequest,
  IAuthWithdrawResponse,
} from '@services/AuthService/type';
import { compare, genSalt, hash } from 'bcrypt';
import UserModel from '@models/UserModel';
import CorporateModel from '@models/CorporateModel';
import CareerModel from '@models/CareerModel';
import CandidateModel from '@models/CandidateModel';
import { MAX_TIMESTAMP } from '@constants/date';
import OauthService from '@services/OauthService';
import PhoneVerifyModel from '@models/PhoneVerifyModel';
import phoneVerifyModel from '@models/PhoneVerifyModel';
import { Op, Sequelize } from 'sequelize';
import RequestService from '@services/RequestService';
import { JwtSingleton } from '@utils/jwt';
import { SensSingleton } from '@utils/sens';
import ExpertModel from '@models/ExpertModel';

class AuthService {
  static async login({
    email,
    password,
    type,
  }: IAuthLoginRequest): Promise<IAuthLoginResponse> {
    const response: IAuthLoginResponse = {
      ok: false,
      error: '',
      authToken: '',
    };
    try {
      // find corporate by email
      const userFindOneResult = await UserModel.findOne({
        attributes: ['id', 'name', 'hashed'],
        where: {
          email,
          type,
        },
      });
      if (!userFindOneResult) {
        response.error = '해당 이메일로 등록된 회원이 없습니다.';
        return response;
      }
      const { id, name, hashed } = userFindOneResult;
      if (!hashed) {
        response.error = '다른 방식으로 로그인 해주세요.';
        return response;
      }
      // compare password with hashed
      const compareResult = await compare(password, hashed);
      if (!compareResult) {
        response.error = '비밀번호가 다릅니다.';
        return response;
      }
      // sign authToken with name, email
      response.authToken = JwtSingleton.sign({
        id,
        name,
        type,
      } as IAuthTokenPayload);
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '로그인에 실패했습니다.';
    }

    return response;
  }

  static async loginOauth({
    provider,
    code,
    redirectUri,
    type,
  }: IAuthLoginOauthRequest): Promise<IAuthLoginOauthResponse> {
    const response: IAuthLoginOauthResponse = {
      ok: false,
      error: '',
      authToken: '',
      registerToken: '',
    };

    try {
      // verify type
      if (type !== 'personal' && type !== 'expert') {
        response.error = '사용자 유형 오류입니다.';
        return response;
      }
      // get email by oauth code
      const getEmailByOauthCodeResponse =
        await OauthService.getEmailByOauthCode({ provider, code, redirectUri });
      if (!getEmailByOauthCodeResponse.ok) {
        response.error = getEmailByOauthCodeResponse.error;
        return response;
      }
      // find user by email
      const userFindOneResult = await UserModel.findOne({
        attributes: ['id', 'name', 'oauthProvider'],
        where: {
          email: getEmailByOauthCodeResponse.email,
          type,
        },
      });
      if (!userFindOneResult) {
        response.registerToken = JwtSingleton.sign({
          provider,
          email: getEmailByOauthCodeResponse.email,
        } as IRegisterTokenPayload);
        response.error = '회원가입이 필요합니다.';
        return response;
      }
      const { id, name, oauthProvider } = userFindOneResult;
      // if oauth provider not matched
      if (oauthProvider !== provider) {
        response.error = '다른 방식으로 로그인 해주세요.';
        return response;
      }
      // sign authToken with email
      response.authToken = JwtSingleton.sign({
        id,
        name,
        type,
      } as IAuthTokenPayload);
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = 'Oauth 로그인에 실패했습니다.';
    }

    return response;
  }

  static async loginCandidate({
    name,
    phone,
  }: IAuthLoginCandidateRequest): Promise<IAuthLoginCandidateResponse> {
    const response: IAuthLoginCandidateResponse = {
      ok: false,
      error: '',
      authToken: '',
    };

    try {
      // verify phone
      const phoneVerifyFindOneResult = await phoneVerifyModel.findOne({
        attributes: ['verifiedAt'],
        where: { phone },
        order: [['createdAt', 'DESC']],
      });
      if (!phoneVerifyFindOneResult) {
        response.error = '전화번호 인증 정보 검색 오류입니다.';
        return response;
      } else if (!phoneVerifyFindOneResult.verifiedAt) {
        response.error = '전화번호 인증 기록이 없습니다.';
        return response;
      }
      // find candidate
      const candidateFindOneResult = await CandidateModel.findOne({
        attributes: ['id', 'requestId'],
        where: {
          name,
          phone,
        },
      });
      if (!candidateFindOneResult) {
        response.error = '지원자를 찾을 수 없습니다.';
        return response;
      }
      // sign authToken with email
      response.authToken = JwtSingleton.sign({
        id: candidateFindOneResult.id,
        name,
        type: 'candidate',
      } as IAuthTokenPayload);
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '지원자 인증에 실패했습니다.';
    }

    return response;
  }

  static async tokenRenew({
    authorization,
  }: IAuthTokenRenewRequest): Promise<IAuthTokenRenewResponse> {
    const response: IAuthTokenRenewResponse = {
      ok: false,
      error: '',
      authToken: '',
    };
    try {
      // extract and decode authToken from authorization header
      const authToken = authorization.split(' ')[1];
      const { id, name, type } = JwtSingleton.decode(
        authToken
      ) as IAuthTokenPayload;
      // sign authToken with email
      response.authToken = JwtSingleton.sign({
        id,
        name,
        type,
      } as IAuthTokenPayload);
      response.ok = true;
    } catch (e) {
      response.error = '토큰 재발급에 실패했습니다.';
    }

    return response;
  }

  static async registerPersonal({
    name,
    phone,
    email,
    password,
    careers,
  }: IAuthRegisterPersonalRequest): Promise<IAuthRegisterPersonalResponse> {
    const response: IAuthRegisterPersonalResponse = {
      ok: false,
      error: '',
    };

    try {
      // verify phone
      const phoneVerifyFindOneResult = await phoneVerifyModel.findOne({
        attributes: ['verifiedAt'],
        where: { phone },
        order: [['createdAt', 'DESC']],
      });
      if (!phoneVerifyFindOneResult) {
        response.error = '전화번호 인증 정보 검색 오류입니다.';
        return response;
      }
      if (!phoneVerifyFindOneResult.verifiedAt) {
        response.error = '전화번호 인증 기록이 없습니다.';
        return response;
      }
      // hash password
      const salt = await genSalt(10);
      const hashed = await hash(password, salt);
      // create user
      const userCreateResult = await UserModel.create({
        name,
        phone,
        email,
        hashed,
        type: 'personal',
      });
      if (!userCreateResult) {
        response.error = '회원 생성 오류입니다.';
        return response;
      }
      // create career
      for (const { corporateName, department, startAt, endAt } of careers) {
        // find or create corporate
        const corporateFindOrCreateResult = await CorporateModel.findOrCreate({
          where: {
            name: corporateName,
          },
          defaults: {
            name: corporateName,
          },
        });
        if (!corporateFindOrCreateResult) {
          response.error = '경력 오류입니다.';
          return response;
        }
        // create career
        const careerCreateResult = await CareerModel.create({
          userId: userCreateResult.id,
          corporateId: corporateFindOrCreateResult[0].id,
          department,
          startAt,
          endAt: endAt || new Date(MAX_TIMESTAMP),
        });
        if (!careerCreateResult) {
          response.error = '경력 생성 오류입니다.';
          return response;
        }
      }
      // update receiver
      const updateReceiverResponse =
        await RequestService.referenceUpdateReceiver({
          userId: userCreateResult.id,
        });
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '개인회원 가입에 실패했습니다.';
    }

    return response;
  }

  static async registerOauthPersonal({
    name,
    phone,
    careers,
    registerToken,
  }: IAuthRegisterOauthPersonalRequest): Promise<IAuthRegisterOauthPersonalResponse> {
    const response: IAuthRegisterOauthPersonalResponse = {
      ok: false,
      error: '',
    };

    try {
      // verify registerToken
      const { provider, email } = JwtSingleton.verify(
        registerToken
      ) as IRegisterTokenPayload;
      // create user
      const userCreateResult = await UserModel.create({
        name,
        phone,
        email,
        type: 'personal',
        oauthProvider: provider,
      });
      if (!userCreateResult) {
        response.error = '회원 생성 오류입니다.';
        return response;
      }
      // verify phone
      const phoneVerifyFindOneResult = await phoneVerifyModel.findOne({
        attributes: ['verifiedAt'],
        where: { phone },
        order: [['createdAt', 'DESC']],
      });
      if (!phoneVerifyFindOneResult) {
        response.error = '전화번호 인증 정보 검색 오류입니다.';
        return response;
      }
      if (!phoneVerifyFindOneResult.verifiedAt) {
        response.error = '전화번호 인증 기록이 없습니다.';
        return response;
      }
      // create career
      for (const { corporateName, department, startAt, endAt } of careers) {
        // find or create corporate
        const corporateFindOrCreateResult = await CorporateModel.findOrCreate({
          where: {
            name: corporateName,
          },
          defaults: {
            name: corporateName,
          },
        });
        if (!corporateFindOrCreateResult) {
          response.error = '경력 오류입니다.';
          return response;
        }
        // create career
        const careerCreateResult = await CareerModel.create({
          userId: userCreateResult.id,
          corporateId: corporateFindOrCreateResult[0].id,
          department,
          startAt,
          endAt: endAt || new Date(MAX_TIMESTAMP),
        });
        if (!careerCreateResult) {
          response.error = '경력 생성 오류입니다.';
          return response;
        }
      }
      // update receiver
      const updateReceiverResponse =
        await RequestService.referenceUpdateReceiver({
          userId: userCreateResult.id,
        });
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = 'Oauth 회원가입에 실패했습니다.';
    }

    return response;
  }

  static async registerCorporate({
    name,
    certificate,
    phone,
    email,
    password,
  }: IAuthRegisterCorporateRequest): Promise<IAuthRegisterCorporateResponse> {
    const response: IAuthRegisterCorporateResponse = {
      ok: false,
      error: '',
    };

    try {
      // verify phone
      const phoneVerifyFindOneResult = await phoneVerifyModel.findOne({
        attributes: ['verifiedAt'],
        where: { phone },
        order: [['createdAt', 'DESC']],
      });
      if (!phoneVerifyFindOneResult) {
        response.error = '전화번호 인증 정보 검색 오류입니다.';
        return response;
      }
      if (!phoneVerifyFindOneResult.verifiedAt) {
        response.error = '전화번호 인증 기록이 없습니다.';
        return response;
      }
      // hash password
      const salt = await genSalt(10);
      const hashed = await hash(password, salt);
      // find or create corporate
      const corporateFindOrCreateResult = await CorporateModel.findOrCreate({
        where: { name },
        defaults: { name },
      });
      if (!corporateFindOrCreateResult) {
        response.error = '기업 생성 오류입니다.';
        return response;
      }
      // create user
      const userCreateResult = await UserModel.create({
        name,
        phone,
        email,
        hashed,
        type: 'corporate',
        corporateId: corporateFindOrCreateResult[0].id,
      });
      if (!userCreateResult) {
        response.error = '회원 생성 오류입니다.';
        return response;
      }
      // update corporate
      const updateCorporateResult = await CorporateModel.update(
        {
          certificateBucket: certificate.bucket,
          certificateKey: certificate.key,
        },
        { where: { id: corporateFindOrCreateResult[0].id } }
      );
      if (!updateCorporateResult) {
        response.error = '기업 정보 업데이트 오류입니다.';
        return response;
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '기업회원 가입에 실패했습니다.';
    }

    return response;
  }

  static async registerExpert({
    name,
    phone,
    email,
    password,
    specialty,
    certificate,
  }: IAuthRegisterExpertRequest) {
    const response: IAuthRegisterExpertResponse = {
      ok: false,
      error: '',
    };

    try {
      // verify phone
      const phoneVerifyFindOneResult = await phoneVerifyModel.findOne({
        attributes: ['verifiedAt'],
        where: { phone },
        order: [['createdAt', 'DESC']],
      });
      if (!phoneVerifyFindOneResult) {
        response.error = '전화번호 인증 정보 검색 오류입니다.';
        return response;
      }
      if (!phoneVerifyFindOneResult.verifiedAt) {
        response.error = '전화번호 인증 기록이 없습니다.';
        return response;
      }
      // hash password
      const salt = await genSalt(10);
      const hashed = await hash(password, salt);
      // create user
      const userCreateResult = await UserModel.create({
        name,
        phone,
        email,
        hashed,
        type: 'expert',
      });
      if (!userCreateResult) {
        response.error = '회원 생성 오류입니다.';
        return response;
      }
      // create expert
      const expertCreateResult = await ExpertModel.create({
        userId: userCreateResult.id,
        specialty,
        certificateBucket: certificate.bucket,
        certificateKey: certificate.key,
      });
      if (!expertCreateResult) {
        response.error = '전문가 생성 오류입니다.';
        return response;
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '전문가 회원 가입에 실패했습니다.';
    }

    return response;
  }

  static async phoneSend({
    phone,
  }: IAuthPhoneSendRequest): Promise<IAuthPhoneSendResponse> {
    const response: IAuthPhoneSendResponse = {
      ok: false,
      error: '',
    };

    try {
      // check if too many
      const phoneVerifyCountResult = await phoneVerifyModel.count({
        where: {
          [Op.or]: [
            Sequelize.literal(
              'TIMESTAMPDIFF(MINUTE, PhoneVerify.createdAt, NOW()) < 5'
            ),
          ],
        },
      });
      if (phoneVerifyCountResult && phoneVerifyCountResult > 3) {
        response.error =
          '인증번호 발송 횟수가 너무 많습니다. 5분 후에 다시 시도해주세요.';
        return response;
      }
      // generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000);
      // create phoneVerify
      const phoneVerifyCreateResult = await PhoneVerifyModel.create({
        phone,
        code,
      });
      if (!phoneVerifyCreateResult) {
        response.error = '인증번호 생성 오류입니다.';
        return response;
      }

      // send code
      const sendMessageResponse = await SensSingleton.sendMessage({
        templateCode: 'verifyCode',
        messages: [
          {
            to: phone,
            content: `인증번호는 ${code} 입니다.`,
          },
        ],
      });
      if (!sendMessageResponse.ok) {
        response.error = sendMessageResponse.error;
        return response;
      }

      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '인증번호 발송에 실패했습니다.';
    }

    return response;
  }

  static async phoneVerify({
    phone,
    code,
  }: IAuthPhoneVerifyRequest): Promise<IAuthPhoneVerifyResponse> {
    const response: IAuthPhoneVerifyResponse = {
      ok: false,
      error: '',
    };

    try {
      // verify code
      const phoneVerifyFindOneResult = await phoneVerifyModel.findOne({
        attributes: ['code', 'createdAt'],
        where: { phone },
        order: [['createdAt', 'DESC']],
      });
      if (!phoneVerifyFindOneResult) {
        response.error = '인증번호 검색 오류입니다.';
        return response;
      } else if (
        new Date().getTime() - phoneVerifyFindOneResult.createdAt.getTime() >
        5 * 60 * 1000
      ) {
        response.error = '유효시간이 경과되었습니다.';
        return response;
      } else if (phoneVerifyFindOneResult.code !== code) {
        response.error = '인증번호가 올바르지 않습니다.';
        return response;
      }
      // update phoneVerify
      const phoneVerifyUpdateResult = await phoneVerifyModel.update(
        {
          verifiedAt: new Date(),
        },
        { where: { phone, code } }
      );
      if (!phoneVerifyUpdateResult) {
        response.error = '인증 정보 업데이트 오류입니다.';
        return response;
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '전화번호 인증에 실패했습니다.';
    }

    return response;
  }

  static async withdraw({
    userId,
  }: IAuthWithdrawRequest): Promise<IAuthWithdrawResponse> {
    const response: IAuthWithdrawResponse = {
      ok: false,
      error: '',
    };

    try {
      // destroy user
      const userDeleteResult = await UserModel.destroy({
        where: { id: userId },
      });
      if (!userDeleteResult) {
        response.error = '사용자 삭제 오류입니다.';
        return response;
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
    }

    return response;
  }
}

export default AuthService;
