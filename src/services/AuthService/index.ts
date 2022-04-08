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
  IAuthRegisterOauthPersonalRequest,
  IAuthRegisterOauthPersonalResponse,
  IRegisterTokenPayload,
  IAuthPhoneSendRequest,
  IAuthPhoneSendResponse,
  IAuthPhoneVerifyRequest,
  IAuthPhoneVerifyResponse,
} from '@services/AuthService/type';
import { compare, genSalt, hash } from 'bcrypt';
import UserModel from '@models/UserModel';
import CorporateModel from '@models/CorporateModel';
import CareerModel from '@models/CareerModel';
import { MAX_TIMESTAMP } from '@constants/date';
import PhoneVerifyModel from '@models/PhoneVerifyModel';
import phoneVerifyModel from '@models/PhoneVerifyModel';
import { Op, Sequelize } from 'sequelize';
import { JwtSingleton } from '@utils/jwt';
import { SensSingleton } from '@utils/sens';
import { InternalService } from '@services/InternalService';
import { SlackSingleton } from '@utils/slack';
import { SequelizeSingleton } from '@utils/sequelize';

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
      // update login at
      const userUpdateResult = await UserModel.update(
        {
          loginAt: new Date(),
        },
        {
          where: {
            id,
          },
        }
      );
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
      if (type !== 'personal') {
        response.error = '사용자 유형 오류입니다.';
        return response;
      }
      // get email by oauth code
      const getEmailByOauthCodeResponse =
        await InternalService.getEmailByOauthCode({
          provider,
          code,
          redirectUri,
        });
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
      // update login at
      const userUpdateResult = await UserModel.update(
        {
          loginAt: new Date(),
        },
        {
          where: {
            id,
          },
        }
      );
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = 'Oauth 로그인에 실패했습니다.';
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
      // transaction
      const transactionResult =
        await SequelizeSingleton.getInstance().transaction(async (t) => {
          // create user
          const userCreateResult = await UserModel.create(
            {
              name,
              phone,
              email,
              hashed,
              type: 'personal',
            },
            { transaction: t }
          );
          if (!userCreateResult) throw new Error('회원 생성 오류입니다.');
          // create career
          for (const { corporateName, department, startAt, endAt } of careers) {
            // find or create corporate
            const corporateFindOrCreateResult =
              await CorporateModel.findOrCreate({
                where: {
                  name: corporateName,
                },
                defaults: {
                  name: corporateName,
                },
                transaction: t,
              });
            if (!corporateFindOrCreateResult)
              throw new Error('경력 오류입니다.');
            // create career
            const careerCreateResult = await CareerModel.create(
              {
                userId: userCreateResult.id,
                corporateId: corporateFindOrCreateResult[0].id,
                department,
                startAt,
                endAt: endAt || new Date(MAX_TIMESTAMP),
              },
              { transaction: t }
            );
            if (!careerCreateResult) throw new Error('경력 생성 오류입니다.');
          }
          return userCreateResult;
        });
      // update candidate
      await InternalService.updateCandidate({
        name,
        phone,
      });
      // update receiver
      await InternalService.updateReceiver({
        userId: transactionResult!.id,
      });
      // slack alarm
      await SlackSingleton.sendMessage(
        '#aws_server',
        'AuthService: 개인 회원 가입'
      );
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
      // transaction
      const transactionResult =
        await SequelizeSingleton.getInstance().transaction(async (t) => {
          // create user
          const userCreateResult = await UserModel.create(
            {
              name,
              phone,
              email,
              type: 'personal',
              oauthProvider: provider,
            },
            { transaction: t }
          );
          if (!userCreateResult) throw new Error('회원 생성 오류입니다.');
          // create career
          for (const { corporateName, department, startAt, endAt } of careers) {
            // find or create corporate
            const corporateFindOrCreateResult =
              await CorporateModel.findOrCreate({
                where: {
                  name: corporateName,
                },
                defaults: {
                  name: corporateName,
                },
                transaction: t,
              });
            if (!corporateFindOrCreateResult)
              throw new Error('경력 오류입니다.');
            // create career
            const careerCreateResult = await CareerModel.create(
              {
                userId: userCreateResult.id,
                corporateId: corporateFindOrCreateResult[0].id,
                department,
                startAt,
                endAt: endAt || new Date(MAX_TIMESTAMP),
              },
              { transaction: t }
            );
            if (!careerCreateResult) throw new Error('경력 생성 오류입니다.');
          }
          return userCreateResult;
        });

      // update candidate
      await InternalService.updateCandidate({
        name,
        phone,
      });
      // update receiver
      await InternalService.updateReceiver({
        userId: transactionResult!.id,
      });
      // slack alarm
      await SlackSingleton.sendMessage(
        '#aws_server',
        'AuthService: 개인 회원 가입'
      );
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
      // transaction
      await SequelizeSingleton.getInstance().transaction(async (t) => {
        // find or create corporate
        const corporateFindOrCreateResult = await CorporateModel.findOrCreate({
          where: { name },
          defaults: { name },
          transaction: t,
        });
        if (!corporateFindOrCreateResult)
          throw new Error('기업 생성 오류입니다.');
        // create user
        const userCreateResult = await UserModel.create(
          {
            name,
            phone,
            email,
            hashed,
            type: 'corporate',
            corporateId: corporateFindOrCreateResult[0].id,
            certificateBucket: certificate.bucket,
            certificateKey: certificate.key,
          },
          { transaction: t }
        );
        if (!userCreateResult) throw new Error('회원 생성 오류입니다.');
      });
      // slack alarm
      await SlackSingleton.sendMessage(
        '#aws_server',
        'AuthService: 기업 회원 가입'
      );
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '기업회원 가입에 실패했습니다.';
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
      // transaction
      await SequelizeSingleton.getInstance().transaction(async (t) => {
        // create phoneVerify
        const phoneVerifyCreateResult = await PhoneVerifyModel.create(
          {
            phone,
            code,
          },
          { transaction: t }
        );
        if (!phoneVerifyCreateResult)
          throw new Error('인증번호 생성 오류입니다.');
        // send code
        const sendMessageResponse = await SensSingleton.sendMessage({
          templateName: 'verifyCode',
          to: phone,
          data: {
            code,
          },
        });
        if (!sendMessageResponse.ok) throw new Error(sendMessageResponse.error);
      });
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
}

export default AuthService;
