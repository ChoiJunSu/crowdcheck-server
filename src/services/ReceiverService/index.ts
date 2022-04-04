import RequestModel from '@models/RequestModel';
import ReceiverModel from '@models/ReceiverModel';
import CareerModel from '@models/CareerModel';
import {
  IReceiverAnswerRequest,
  IReceiverAnswerResponse,
  IReceiverGetAnswerRequest,
  IReceiverGetAnswerResponse,
  IReceiverGetVerifyRequest,
  IReceiverGetVerifyResponse,
  IReceiverRejectRequest,
  IReceiverRejectResponse,
  IReceiverVerifyRequest,
  IReceiverVerifyResponse,
} from '@services/ReceiverService/type';
import UserModel from '@models/UserModel';
import { SensSingleton } from '@utils/sens';
import ReferenceModel from '@models/ReferenceModel';
import ReferenceDetailModel from '@models/ReferenceDetailModel';
import { Op } from 'sequelize';
import CorporateModel from '@models/CorporateModel';

class ReceiverService {
  static async getVerify({
    requestId,
    userId,
  }: IReceiverGetVerifyRequest): Promise<IReceiverGetVerifyResponse> {
    const response: IReceiverGetVerifyResponse = {
      ok: false,
      error: '',
      candidateName: '',
      career: null,
    };

    try {
      // verify user, request, and receiver status
      const requestFindOneResult = await RequestModel.findOne({
        attributes: ['candidateName'],
        where: {
          id: requestId,
          status: 'agreed',
        },
        include: [
          {
            model: ReceiverModel,
            attributes: ['careerId'],
            where: { userId, status: 'received' },
          },
        ],
      });
      if (
        !requestFindOneResult ||
        !requestFindOneResult.Receivers ||
        !requestFindOneResult.Receivers[0]
      ) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      }
      // find career and corporate name
      const careerFindOneResult = await CareerModel.findOne({
        where: { id: requestFindOneResult.Receivers[0].careerId },
        include: {
          model: CorporateModel,
          attributes: ['name'],
        },
      });
      if (!careerFindOneResult || !careerFindOneResult.Corporate) {
        response.error = '경력 검색 오류입니다.';
        return response;
      }
      const {
        id,
        corporateId,
        department,
        startAt,
        endAt,
        verifiedAt,
        Corporate,
      } = careerFindOneResult;
      response.candidateName = requestFindOneResult.candidateName;
      response.career = {
        id,
        corporateId,
        corporateName: Corporate.name,
        department,
        startAt,
        endAt,
        verifiedAt,
      };
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '수신자 검증에 실패했습니다.';
    }

    return response;
  }

  static async verify({
    requestId,
    userId,
    candidatePhone,
  }: IReceiverVerifyRequest): Promise<IReceiverVerifyResponse> {
    const response: IReceiverVerifyResponse = {
      ok: false,
      error: '',
    };

    try {
      // verify user, request, and receiver status
      const requestFindOneResult = await RequestModel.findOne({
        attributes: ['candidatePhone', 'status'],
        where: {
          id: requestId,
          status: 'agreed',
        },
        include: [
          {
            model: ReceiverModel,
            attributes: ['id', 'status'],
            where: { userId, status: 'received' },
            include: [CareerModel],
          },
        ],
      });
      if (!requestFindOneResult || !requestFindOneResult.Receivers) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      } else if (
        !requestFindOneResult.Receivers[0] ||
        !requestFindOneResult.Receivers[0].Career
      ) {
        response.error = '평가자 검색 오류입니다.';
        return response;
      } else if (requestFindOneResult.candidatePhone !== candidatePhone) {
        response.error = '지원자 정보가 올바르지 않습니다.';
        return response;
      } else if (!requestFindOneResult.Receivers[0].Career.verifiedAt) {
        response.error = '경력 인증이 필요합니다.';
        return response;
      }
      // update receiver status and verifiedAt
      const receiverUpdateResult = await ReceiverModel.update(
        {
          verifiedAt: new Date(),
          status: 'verified',
        },
        { where: { id: requestFindOneResult.Receivers[0].id } }
      );
      if (!receiverUpdateResult) {
        response.error = '의뢰 상태 업데이트 오류입니다.';
        return response;
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '수신자 검증에 실패했습니다.';
    }

    return response;
  }

  static async getAnswer({
    requestId,
    userId,
  }: IReceiverGetAnswerRequest): Promise<IReceiverGetAnswerResponse> {
    const response: IReceiverGetAnswerResponse = {
      ok: false,
      error: '',
      request: null,
    };

    try {
      // verify request and user
      const receiverFindOneResult = await ReceiverModel.findOne({
        attributes: ['id', 'status'],
        where: { userId, status: 'verified' },
        include: [
          {
            model: RequestModel,
            where: { status: { [Op.not]: 'closed' } },
          },
          {
            model: CorporateModel,
            attributes: ['name'],
          },
        ],
      });
      if (
        !receiverFindOneResult ||
        !receiverFindOneResult.Request ||
        !receiverFindOneResult.Corporate
      ) {
        response.error = '수신자 검색 오류입니다.';
        return response;
      }
      const { id, candidateName, deadline, status, createdAt } =
        receiverFindOneResult.Request;
      response.request = {
        id,
        corporateName: receiverFindOneResult.Corporate.name,
        candidateName,
        deadline,
        status,
        receiverStatus: receiverFindOneResult.status,
        createdAt,
      };
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 정보 불러오기에 실패했습니다.';
    }

    return response;
  }

  static async answer({
    requestId,
    userId,
    type,
    relationship,
    details,
  }: IReceiverAnswerRequest): Promise<IReceiverAnswerResponse> {
    const response: IReceiverAnswerResponse = {
      ok: false,
      error: '',
    };

    try {
      // verify user, request and receiver status
      const requestFindOneResult = await RequestModel.findOne({
        attributes: ['status', 'ownerId', 'candidateId'],
        where: {
          id: requestId,
          status: 'agreed',
        },
        include: {
          model: ReceiverModel,
          attributes: ['id', 'corporateId', 'status'],
          where: { userId, status: 'verified' },
        },
      });
      if (
        !requestFindOneResult ||
        !requestFindOneResult.Receivers ||
        !requestFindOneResult.candidateId
      ) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      } else if (!requestFindOneResult.Receivers[0]) {
        response.error = '평가자 오류입니다.';
        return response;
      }
      // create reference
      const referenceCreateResult = await ReferenceModel.create({
        ownerId:
          type === 'nomination' ? requestFindOneResult.candidateId : userId,
        targetId: requestFindOneResult.candidateId,
        writerId: userId,
        corporateId: requestFindOneResult.Receivers[0].corporateId,
        type,
        relationship,
      });
      if (!referenceCreateResult) {
        response.error = '답변 생성 오류입니다.';
        return response;
      }
      // create reference details
      for (const { question, score, answer } of details) {
        const referenceDetailCreateResult = await ReferenceDetailModel.create({
          referenceId: referenceCreateResult.id,
          question,
          score,
          answer,
        });
        if (!referenceDetailCreateResult) {
          response.error = '답변 항목 생성 오류입니다.';
          return response;
        }
      }
      // update receiver status
      const receiverUpdateResult = await ReceiverModel.update(
        {
          status: 'answered',
          answeredAt: new Date(),
        },
        { where: { id: requestFindOneResult.Receivers[0].id } }
      );
      if (!receiverUpdateResult) {
        response.error = '의뢰 상태 업데이트 오류입니다.';
        return response;
      }
      // find owner phone
      const userFineOneResult = await UserModel.findOne({
        attributes: ['phone'],
        where: { id: requestFindOneResult.ownerId },
      });
      if (!userFineOneResult) {
        response.error = '의뢰자 검색 오류입니다.';
        return response;
      }
      // send alarm
      const sendMessageResponse = await SensSingleton.sendMessage({
        templateName: 'answer',
        to: userFineOneResult.phone,
      });
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 답변에 실패했습니다.';
    }

    return response;
  }

  static async reject({
    requestId,
    userId,
  }: IReceiverRejectRequest): Promise<IReceiverRejectResponse> {
    const response: IReceiverRejectResponse = {
      ok: false,
      error: '',
    };

    try {
      // verify requestId with userId
      const requestFindOneResult = await RequestModel.findOne({
        attributes: ['status'],
        where: {
          id: requestId,
          status: 'agreed',
        },
        include: {
          model: ReceiverModel,
          attributes: ['id', 'status'],
          where: { userId, status: { [Op.or]: ['received', 'verified'] } },
        },
      });
      if (!requestFindOneResult || !requestFindOneResult.Receivers) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      } else if (!requestFindOneResult.Receivers[0]) {
        response.error = '평가자 오류입니다.';
        return response;
      }
      // update receiver status
      const receiverUpdateResult = await ReceiverModel.update(
        {
          rejectedAt: new Date(),
          status: 'rejected',
        },
        { where: { id: requestFindOneResult.Receivers[0].id } }
      );
      if (!receiverUpdateResult) {
        response.error = '의뢰 상태 업데이트 오류입니다.';
        return response;
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 거절에 실패했습니다.';
    }

    return response;
  }
}

export default ReceiverService;
