import {
  IRequestListCandidateRequest,
  IRequestListCandidateResponse,
  IRequestAgreeRequest,
  IRequestAgreeResponse,
  IRequestListReceiverRequest,
  IRequestListReceiverResponse,
  IRequestListCorporateRequest,
  IRequestListCorporateResponse,
  IRequestDetailCorporateRequest,
  IRequestDetailCorporateResponse,
  IRequestGetAgreeCorporateRequest,
  IRequestGetAgreeCorporateResponse,
  IRequestRegisterRequest,
  IRequestRegisterResponse,
  IRequestCloseRequest,
  IRequestCloseResponse,
  IRequestGetAgreeCandidateRequest,
  IRequestGetAgreeCandidateResponse,
} from '@services/RequestService/type';
import RequestModel from '@models/RequestModel';
import CorporateModel from '@models/CorporateModel';
import CareerModel from '@models/CareerModel';
import { Op, Sequelize } from 'sequelize';
import ReceiverModel from '@models/ReceiverModel';
import { MAX_TIMESTAMP, REQUEST_DEADLINE } from '@constants/date';
import UserModel from '@models/UserModel';
import { SensSingleton } from '@utils/sens';
import ReferenceModel from '@models/ReferenceModel';
import ReferenceDetailModel from '@models/ReferenceDetailModel';
import { InternalService } from '@services/InternalService';
import AgreeModel from '@models/AgreeModel';
import { SlackSingleton } from '@utils/slack';
import { SequelizeSingleton } from '@utils/sequelize';

class RequestService {
  static async register({
    userId,
    candidateName,
    candidatePhone,
  }: IRequestRegisterRequest): Promise<IRequestRegisterResponse> {
    const response: IRequestRegisterResponse = {
      ok: false,
      error: '',
    };

    try {
      // find corporate id
      const userFindOneResult = await UserModel.findOne({
        attributes: ['name', 'corporateId'],
        where: { id: userId },
      });
      if (!userFindOneResult || !userFindOneResult.corporateId) {
        response.error = '사용자 검색 오류입니다.';
        return response;
      }
      // transaction
      await SequelizeSingleton.getInstance().transaction(async (t) => {
        // create request
        const createRequestResult = await RequestModel.create(
          {
            ownerId: userId,
            corporateId: userFindOneResult.corporateId!,
            candidateName,
            candidatePhone,
            deadline: new Date(
              new Date().setDate(new Date().getDate() + REQUEST_DEADLINE)
            ),
          },
          { transaction: t }
        );
        if (!createRequestResult) throw new Error('의뢰 생성 오류입니다.');
        // update candidate
        const updateCandidateResponse = await InternalService.updateCandidate({
          name: candidateName,
          phone: candidatePhone,
        });
        if (!updateCandidateResponse.ok)
          throw new Error(updateCandidateResponse.error);
      });
      // slack alarm
      await SlackSingleton.sendMessage(
        '#aws_server',
        'RequestService: 의뢰 등록'
      );
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 등록에 실패했습니다.';
      return response;
    }

    return response;
  }

  static async listCorporate({
    userId,
  }: IRequestListCorporateRequest): Promise<IRequestListCorporateResponse> {
    const response: IRequestListCorporateResponse = {
      ok: false,
      error: '',
      requests: [],
    };

    try {
      // find requests
      const requestFindAllResult = await RequestModel.findAll({
        attributes: [
          'id',
          'candidateId',
          'candidateName',
          'deadline',
          'status',
          'createdAt',
        ],
        where: {
          ownerId: userId,
          status: { [Op.not]: 'closed' },
        },
        order: [['createdAt', 'DESC']],
      });
      if (!requestFindAllResult) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      }
      // find receiver and push request
      for (const {
        id,
        candidateId,
        candidateName,
        deadline,
        status,
        createdAt,
      } of requestFindAllResult) {
        // count references
        const referenceCountResult = await ReferenceModel.count({
          where: { targetId: candidateId },
        });
        // generate response
        response.requests.push({
          id,
          candidateName,
          deadline,
          referenceCount: referenceCountResult,
          status,
          createdAt,
        });
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 목록을 불러오는데 실패했습니다.';
    }

    return response;
  }

  static async listReceiver({
    userId,
  }: IRequestListReceiverRequest): Promise<IRequestListReceiverResponse> {
    const response: IRequestListReceiverResponse = {
      ok: false,
      error: '',
      requests: [],
    };

    try {
      // find receivers
      const receiverFindAllResult = await ReceiverModel.findAll({
        attributes: ['requestId', 'status'],
        where: { userId },
      });
      if (!receiverFindAllResult) {
        response.error = '요청 검색 오류입니다.';
        return response;
      }
      for (const Receiver of receiverFindAllResult) {
        const requestFindOneResult = await RequestModel.findOne({
          attributes: [
            'id',
            'candidateName',
            'deadline',
            'status',
            'createdAt',
          ],
          where: {
            id: Receiver.requestId,
            status: { [Op.not]: 'closed' },
          },
          include: [
            {
              model: CorporateModel,
              attributes: ['name'],
            },
          ],
        });
        if (!requestFindOneResult || !requestFindOneResult.Corporate) continue;
        const { id, candidateName, deadline, status, createdAt, Corporate } =
          requestFindOneResult;
        // find receiver status
        const receiverFindOneResult = await ReceiverModel.findOne({
          attributes: ['status'],
          where: { requestId: id, userId },
        });
        if (!receiverFindOneResult) {
          response.error = '수신자 검색 오류입니다.';
          return response;
        }
        // generate response
        response.requests.push({
          id,
          deadline,
          status,
          createdAt,
          corporateName: Corporate.name!,
          candidateName,
          receiverStatus: Receiver.status,
        });
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 목록을 불러오는데 실패했습니다.';
    }

    return response;
  }

  static async listCandidate({
    userId,
  }: IRequestListCandidateRequest): Promise<IRequestListCandidateResponse> {
    const response: IRequestListCandidateResponse = {
      ok: false,
      error: '',
      requests: [],
    };

    try {
      // find requests
      const requestFindAllResult = await RequestModel.findAll({
        attributes: ['id', 'deadline', 'status', 'createdAt'],
        where: {
          candidateId: userId,
          status: { [Op.not]: 'closed' },
        },
        include: [{ model: CorporateModel, attributes: ['name'] }],
      });
      if (!requestFindAllResult) {
        response.error = '지원자 의뢰 검색 오류입니다.';
        return response;
      }
      for (const {
        id,
        deadline,
        status,
        createdAt,
        Corporate,
      } of requestFindAllResult) {
        if (!Corporate) continue;
        response.requests.push({
          id,
          corporateName: Corporate.name,
          deadline,
          status,
          createdAt,
        });
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 목록을 불러오는데 실패했습니다.';
    }

    return response;
  }

  static async detailCorporate({
    requestId,
    userId,
  }: IRequestDetailCorporateRequest): Promise<IRequestDetailCorporateResponse> {
    const response: IRequestDetailCorporateResponse = {
      ok: false,
      error: '',
      request: null,
      nominationReferences: [],
      blindReferences: [],
    };

    try {
      // find request
      const requestFindOneResult = await RequestModel.findOne({
        attributes: [
          'id',
          'candidateId',
          'candidateName',
          'deadline',
          'status',
          'createdAt',
        ],
        where: {
          id: requestId,
          ownerId: userId,
          status: { [Op.not]: 'closed' },
        },
      });
      if (!requestFindOneResult) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      }
      const { id, candidateId, candidateName, deadline, status, createdAt } =
        requestFindOneResult;
      // find references
      const referenceFindAndCountAllResult =
        await ReferenceModel.findAndCountAll({
          attributes: ['id', 'type', 'relationship', 'createdAt'],
          where: { targetId: candidateId },
          include: [CorporateModel, ReferenceDetailModel],
        });
      // generate response
      for (const Reference of referenceFindAndCountAllResult.rows) {
        if (!Reference.Corporate || !Reference.ReferenceDetails) continue;
        if (Reference.type === 'nomination') {
          response.nominationReferences.push({
            id: Reference.id,
            corporateName: Reference.Corporate.name,
            type: Reference.type,
            relationship: Reference.relationship,
            createdAt,
            details: Reference.ReferenceDetails.map(
              ({ id, question, score, answer }) => ({
                id,
                question,
                score,
                answer,
              })
            ),
          });
        } else {
          response.blindReferences.push({
            id: Reference.id,
            corporateName: Reference.Corporate.name,
            type: Reference.type,
            relationship: Reference.relationship,
            createdAt,
            details: Reference.ReferenceDetails.map(
              ({ id, question, score, answer }) => ({
                id,
                question,
                score,
                answer,
              })
            ),
          });
        }
      }
      response.request = {
        id,
        candidateName,
        deadline,
        referenceCount: referenceFindAndCountAllResult.rows.length,
        status,
        createdAt,
      };
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 정보를 불러오는데 실패했습니다.';
    }

    return response;
  }

  static async getAgreeCorporate({
    requestId,
    userId,
  }: IRequestGetAgreeCorporateRequest): Promise<IRequestGetAgreeCorporateResponse> {
    const response: IRequestGetAgreeCorporateResponse = {
      ok: false,
      error: '',
      candidateName: '',
      agrees: [],
    };

    try {
      // find request
      const requestFindOneResult = await RequestModel.findOne({
        attributes: ['candidateName'],
        where: {
          id: requestId,
          ownerId: userId,
          status: { [Op.not]: 'closed' },
        },
        include: [
          {
            model: AgreeModel,
            attributes: ['disagreeReason', 'agreedAt'],
            include: [CareerModel, CorporateModel],
          },
        ],
      });
      if (!requestFindOneResult || !requestFindOneResult.Agrees) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      }
      const { candidateName, Agrees } = requestFindOneResult;
      if (!Agrees) {
        response.error = '지원자 검색 오류입니다.';
        return response;
      }
      for (const { Career, Corporate, disagreeReason, agreedAt } of Agrees) {
        if (!Career || !Corporate) continue;
        const { id, corporateId, department, startAt, endAt, verifiedAt } =
          Career;
        response.agrees.push({
          career: {
            id,
            corporateId,
            corporateName: Corporate.name,
            department,
            startAt,
            endAt:
              endAt.getTime() === new Date(MAX_TIMESTAMP).getTime()
                ? null
                : endAt,
            verifiedAt,
          },
          disagreeReason,
          agreed: agreedAt !== null,
        });
      }
      response.candidateName = candidateName;
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 동의 현황을 불러오는데 실패했습니다.';
    }

    return response;
  }

  static async getAgreeCandidate({
    requestId,
    userId,
  }: IRequestGetAgreeCandidateRequest): Promise<IRequestGetAgreeCandidateResponse> {
    const response: IRequestGetAgreeCandidateResponse = {
      ok: false,
      error: '',
      corporateName: '',
      careers: [],
    };

    try {
      // find request
      const requestFindOneResult = await RequestModel.findOne({
        attributes: ['id'],
        where: {
          id: requestId,
          candidateId: userId,
          status: { [Op.not]: 'closed' },
        },
        include: {
          model: CorporateModel,
          attributes: ['name'],
        },
      });
      if (!requestFindOneResult || !requestFindOneResult.Corporate) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      }
      // find careers
      const careerFindAllResult = await CareerModel.findAll({
        where: { userId },
        include: {
          model: CorporateModel,
          attributes: ['name'],
        },
      });
      if (!careerFindAllResult) {
        response.error = '경력 검색 오류입니다.';
        return response;
      }
      for (const {
        id,
        corporateId,
        department,
        startAt,
        endAt,
        verifiedAt,
        Corporate,
      } of careerFindAllResult) {
        if (!Corporate) continue;
        response.careers.push({
          id,
          corporateId,
          corporateName: Corporate.name,
          department,
          startAt,
          endAt:
            endAt.getTime() === new Date(MAX_TIMESTAMP).getTime()
              ? null
              : endAt,
          verifiedAt,
        });
      }
      response.corporateName = requestFindOneResult.Corporate.name;
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '동의 목록 불러오기에 실패했습니다.';
    }

    return response;
  }

  static async agree({
    userId,
    requestId,
    agrees,
  }: IRequestAgreeRequest): Promise<IRequestAgreeResponse> {
    const response: IRequestAgreeResponse = {
      ok: false,
      error: '',
    };

    try {
      // verify userId with request
      const requestFindOneResult = await RequestModel.findOne({
        attributes: ['candidateId'],
        where: {
          id: requestId,
          status: 'registered',
        },
      });
      if (!requestFindOneResult || !requestFindOneResult.candidateId) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      } else if (requestFindOneResult.candidateId !== userId) {
        response.error = '지원자 오류입니다.';
        return response;
      }
      // transaction
      await SequelizeSingleton.getInstance().transaction(async (t) => {
        for (const { career, agreed, disagreeReason } of agrees) {
          // create agree
          const agreeCreateResult = await AgreeModel.create(
            {
              requestId,
              careerId: career.id,
              corporateId: career.corporateId,
              agreedAt: agreed ? new Date() : null,
              disagreeReason,
            },
            { transaction: t }
          );
          if (!agreeCreateResult)
            throw new Error('지원자 동의 생성 오류입니다.');
          if (!agreed) continue;
          // find careers
          const careerFindAllResult = await CareerModel.findAll({
            attributes: ['id', 'userId', 'corporateId'],
            where: {
              userId: { [Op.not]: userId },
              [Op.or]: [
                Sequelize.literal(
                  `startAt BETWEEN '${career.startAt}' AND '${career.endAt}'`
                ),
                Sequelize.literal(
                  `'${career.startAt}' BETWEEN startAt AND endAt`
                ),
              ],
            },
            include: {
              model: UserModel,
              attributes: ['phone'],
            },
          });
          if (!careerFindAllResult) continue;
          // create receiver
          for (const Career of careerFindAllResult) {
            if (!Career.User) continue;
            // check if the user already wrote reference to the candidate
            const referenceCountResult = await ReferenceModel.count({
              where: { writerId: Career.userId, targetId: userId },
            });
            if (referenceCountResult > 0) continue;
            const receiverCreateResult = await ReceiverModel.create(
              {
                userId: Career.userId,
                careerId: Career.id,
                corporateId: Career.corporateId,
                requestId,
              },
              { transaction: t }
            );
            if (!receiverCreateResult) continue;
            // send alarm
            await SensSingleton.sendMessage({
              templateName: 'receive',
              to: Career.User.phone,
            });
          }
        }
        // update request
        const requestUpdateResult = await RequestModel.update(
          { status: 'agreed' },
          { where: { id: requestId }, transaction: t }
        );
        if (!requestUpdateResult)
          throw new Error('의뢰 정보 업데이트 오류입니다.');
      });
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '지원자 동의에 실패했습니다.';
    }

    return response;
  }

  static async close({
    userId,
    requestId,
  }: IRequestCloseRequest): Promise<IRequestCloseResponse> {
    const response: IRequestCloseResponse = {
      ok: false,
      error: '',
    };

    try {
      // verify userId with requestId
      const requestFindOneResult = await RequestModel.findOne({
        attributes: ['status'],
        where: {
          id: requestId,
          ownerId: userId,
          status: { [Op.or]: ['registered', 'agreed'] },
        },
      });
      if (!requestFindOneResult) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      }
      // update request
      const requestUpdateResult = await RequestModel.update(
        {
          status: 'closed',
          closedAt: new Date(),
        },
        { where: { id: requestId } }
      );
      if (!requestUpdateResult) {
        response.error = '의뢰 업데이트 오류입니다.';
        return response;
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 마감에 실패했습니다.';
    }

    return response;
  }
}

export default RequestService;
