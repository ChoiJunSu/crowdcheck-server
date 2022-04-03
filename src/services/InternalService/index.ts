import {
  IRequestUpdateCandidateRequest,
  IRequestUpdateCandidateResponse,
  IRequestUpdateReceiverRequest,
  IRequestUpdateReceiverResponse,
} from '@services/InternalService/type';
import UserModel from '@models/UserModel';
import RequestModel from '@models/RequestModel';
import { SensSingleton } from '@utils/sens';
import CareerModel from '@models/CareerModel';
import { Op } from 'sequelize';
import AgreeModel from '@models/AgreeModel';
import ReferenceModel from '@models/ReferenceModel';
import ReceiverModel from '@models/ReceiverModel';
import {
  IOauthGetEmailByOauthCodeRequest,
  IOauthGetEmailByOauthCodeResponse,
} from '@services/InternalService/type';
import { URLSearchParams } from 'url';
import { SecretsManagerSingleton } from '@utils/secretesManager';
import axios from 'axios';

export class InternalService {
  static async getEmailByOauthCode({
    provider,
    code,
    redirectUri,
  }: IOauthGetEmailByOauthCodeRequest): Promise<IOauthGetEmailByOauthCodeResponse> {
    const response: IOauthGetEmailByOauthCodeResponse = {
      ok: false,
      error: '',
      email: '',
    };

    try {
      // get email by oauth code
      switch (provider) {
        case 'kakao': {
          const params = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: SecretsManagerSingleton.getSecrete('KAKAO_CLIENT_ID'),
            redirect_uri: redirectUri,
            code,
            client_secret: SecretsManagerSingleton.getSecrete(
              'KAKAO_CLIENT_SECRET'
            ),
          });
          // get access token by oauth code
          const {
            data: { access_token },
          } = await axios.post(
            'https://kauth.kakao.com/oauth/token',
            params.toString(),
            {
              headers: {
                'Content-Type':
                  'application/x-www-form-urlencoded;charset=utf-8',
              },
            }
          );
          if (!access_token) {
            response.error = `카카오로부터 정보를 불러오지 못했습니다.`;
            return response;
          }
          // get kakao account by oauth access token
          const {
            data: { kakao_account },
          } = await axios.get('https://kapi.kakao.com/v2/user/me', {
            headers: {
              Authorization: `Bearer ${access_token}`,
              'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            },
          });
          if (!kakao_account || !kakao_account.has_email) {
            response.error = `카카오로부터 정보를 불러오지 못했습니다.`;
            return response;
          }
          response.email = kakao_account.email;
          break;
        }

        case 'google': {
          const params = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: SecretsManagerSingleton.getSecrete('GOOGLE_CLIENT_ID'),
            redirect_uri: redirectUri,
            code,
            client_secret: SecretsManagerSingleton.getSecrete(
              'GOOGLE_CLIENT_SECRET'
            ),
          });
          // get access token by oauth code
          const {
            data: { access_token },
          } = await axios.post(
            'https://oauth2.googleapis.com/token',
            params.toString(),
            {
              headers: {
                'Content-Type':
                  'application/x-www-form-urlencoded;charset=utf-8',
              },
            }
          );
          if (!access_token) {
            response.error = `구글로부터 정보를 불러오지 못했습니다.`;
            return response;
          }
          // get google data by oauth access token
          const { data } = await axios.get(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
                'Content-Type':
                  'application/x-www-form-urlencoded;charset=utf-8',
              },
            }
          );
          if (!data) {
            response.error = `구글로부터 정보를 불러오지 못했습니다.`;
            return response;
          }
          response.email = data.email;
          break;
        }

        default: {
          break;
        }
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = 'Oauth 정보를 불러오는데 실패했습니다.';
    }

    return response;
  }

  static async updateCandidate({
    name,
    phone,
  }: IRequestUpdateCandidateRequest): Promise<IRequestUpdateCandidateResponse> {
    const response: IRequestUpdateCandidateResponse = {
      ok: false,
      error: '',
    };
    try {
      // find request
      const requestFindOneResult = await RequestModel.findOne({
        attributes: ['id'],
        where: {
          candidateName: name,
          candidatePhone: phone,
          status: 'registered',
        },
      });
      if (!requestFindOneResult) {
        response.error = '의뢰를 찾을 수 없습니다.';
        return response;
      }
      // find user
      const userFindOneResult = await UserModel.findOne({
        attributes: ['id'],
        where: {
          name,
          phone,
          type: 'personal',
        },
      });
      if (userFindOneResult) {
        // if candidate is already our user
        const requestUpdateResult = await RequestModel.update(
          { candidateId: userFindOneResult.id },
          { where: { id: requestFindOneResult.id } }
        );
        if (!requestUpdateResult) {
          response.error = '의뢰 정보 업데이트 오류입니다.';
          return response;
        }
        const sendMessageResponse = await SensSingleton.sendMessage({
          templateName: 'agree',
          to: phone,
        });
        if (!sendMessageResponse.ok) {
          response.error = sendMessageResponse.error;
          return response;
        }
      } else {
        // if candidate needs registration
        const sendMessageResponse = await SensSingleton.sendMessage({
          templateName: 'candidate',
          to: phone,
        });
        if (!sendMessageResponse.ok) {
          response.error = sendMessageResponse.error;
          return response;
        }
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '지원자 업데이트에 실패했습니다.';
    }

    return response;
  }

  static async updateReceiver({
    userId,
  }: IRequestUpdateReceiverRequest): Promise<IRequestUpdateReceiverResponse> {
    const response: IRequestUpdateReceiverResponse = {
      ok: false,
      error: '',
    };

    try {
      // find careers
      const careerFindAllResult = await CareerModel.findAll({
        attributes: ['id', 'corporateId'],
        where: { userId },
      });
      if (!careerFindAllResult) {
        response.error = '경력 검색 오류입니다.';
        return response;
      }
      for (const Career of careerFindAllResult) {
        // find requests
        const requestFindAllResult = await RequestModel.findAll({
          attributes: ['id', 'candidateId'],
          where: {
            status: { [Op.not]: 'closed' },
            candidateId: { [Op.not]: userId },
          },
          include: {
            model: AgreeModel,
            attributes: ['id'],
            where: {
              corporateId: Career.corporateId,
              agreedAt: { [Op.not]: null },
            },
          },
        });
        if (!requestFindAllResult) continue;
        for (const Request of requestFindAllResult) {
          // check if this user already wrote reference to the candidate
          const referenceCountResult = await ReferenceModel.count({
            where: { writerId: userId, targetId: Request.candidateId },
          });
          if (referenceCountResult > 0) continue;
          // find or create receiver
          const receiverFindOrCreateResult = await ReceiverModel.findOrCreate({
            attributes: ['id'],
            where: { requestId: Request.id, userId },
            defaults: {
              requestId: Request.id,
              careerId: Career.id,
              corporateId: Career.corporateId,
              userId,
            },
          });
          if (!receiverFindOrCreateResult || !receiverFindOrCreateResult[1])
            continue;
          // find user
          const userFindOneResult = await UserModel.findOne({
            attributes: ['phone'],
            where: { id: userId },
          });
          if (!userFindOneResult) continue;
          // send alarm
          const sendMessageResponse = await SensSingleton.sendMessage({
            templateName: 'receive',
            to: userFindOneResult.phone,
          });
        }
      }
    } catch (e) {
      console.error(e);
      response.error = '의뢰 목록 업데이트에 실패했습니다.';
    }

    return response;
  }
}
