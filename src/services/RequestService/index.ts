import {
  IRequestRegisterRequest,
  IRequestRegisterResponse,
  IRequestGetCandidateRequest,
  IRequestGetCandidateResponse,
  IRequestListCandidateRequest,
  IRequestListCandidateResponse,
  IRequestAgreeRequest,
  IRequestAgreeResponse,
  IRequestListReceiverRequest,
  IRequestListReceiverResponse,
  IRequestVerifyRequest,
  IRequestVerifyResponse,
  IRequestGetReceiverRequest,
  IRequestGetReceiverResponse,
  IRequestAnswerRequest,
  IRequestAnswerResponse,
  IRequestListCorporateRequest,
  IRequestListCorporateResponse,
  IRequestGetCorporateRequest,
  IRequestGetCorporateResponse,
  IRequestRejectRequest,
  IRequestRejectResponse,
} from '@services/RequestService/type';
import RequestModel from '@models/RequestModel';
import CorporateModel from '@models/CorporateModel';
import CandidateModel from '@models/CandidateModel';
import CandidateAgreeModel from '@models/CandidateAgreeModel';
import { randomBytes } from 'crypto';
import CareerModel from '@models/CareerModel';
import { Op, Sequelize } from 'sequelize';
import ReceiverModel from '@models/ReceiverModel';
import { MAX_TIMESTAMP } from '@constants/date';
import UserModel from '@models/UserModel';
import { ICorporateRequest } from '@controllers/RequestController/type';

class RequestService {
  static register = async ({
    userId,
    name,
    phone,
    career,
    question,
    deadline,
  }: IRequestRegisterRequest): Promise<IRequestRegisterResponse> => {
    const response: IRequestRegisterResponse = {
      ok: false,
      error: '',
      code: '',
    };

    try {
      // find corporate id
      const userFindOneResult = await UserModel.findOne({
        attributes: ['corporateId'],
        where: { id: userId },
      });
      if (!userFindOneResult || !userFindOneResult.corporateId) {
        response.error = '사용자 검색 오류입니다.';
        return response;
      }
      // create request
      const createRequestResult = await RequestModel.create({
        corporateId: userFindOneResult.corporateId,
        question,
        deadline: deadline || new Date(MAX_TIMESTAMP),
      });
      if (!createRequestResult) {
        response.error = '의뢰 생성 오류입니다.';
        return response;
      }
      // generate code
      const randomByteResult = await randomBytes(10);
      const code = randomByteResult.toString('hex');
      // create candidate
      const createCandidateResult = await CandidateModel.create({
        requestId: createRequestResult.id,
        name,
        phone,
        code,
      });
      if (!createCandidateResult) {
        response.error = '지원자 생성 오류입니다.';
        return response;
      }
      // create candidate agree
      for (const { corporateName, department, startAt, endAt } of career) {
        // find or create corporate
        const corporateFindOrCreateResult = await CorporateModel.findOrCreate({
          where: { name: corporateName },
          defaults: { name: corporateName },
        });
        if (!corporateFindOrCreateResult) {
          response.error = '경력 오류입니다.';
          return response;
        }
        // create candidateAgree
        const candidateAgreeCreateResult = await CandidateAgreeModel.create({
          requestId: createRequestResult.id,
          corporateId: corporateFindOrCreateResult[0].id,
          candidateId: createCandidateResult.id,
          department,
          startAt,
          endAt: endAt || new Date(MAX_TIMESTAMP),
        });
        if (!candidateAgreeCreateResult) {
          response.error = '지원자 동의 생성 오류입니다.';
          return response;
        }
      }
      response.code = code;
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 등록에 실패했습니다.';
      return response;
    }

    return response;
  };

  static getReceiver = async ({
    requestId,
    userId,
  }: IRequestGetReceiverRequest): Promise<IRequestGetReceiverResponse> => {
    const response: IRequestGetReceiverResponse = {
      ok: false,
      error: '',
      corporateName: '',
      candidateName: '',
      question: '',
    };

    try {
      // verify userId with receiver
      const receiverFindOneResult = await ReceiverModel.findOne({
        attributes: ['userId'],
        where: { requestId },
      });
      if (!receiverFindOneResult) {
        response.error = '사용자 검색 오류입니다.';
        return response;
      }
      if (receiverFindOneResult.userId !== userId) {
        response.error = '잘못된 접근입니다.';
        return response;
      }
      // find request, corporate, candidate
      const requestFindOneResult = await RequestModel.findOne({
        attributes: ['question'],
        where: { id: requestId },
        include: [
          {
            model: CorporateModel,
            attributes: ['name'],
          },
          {
            model: CandidateModel,
            attributes: ['name'],
          },
        ],
      });
      if (
        !requestFindOneResult ||
        !requestFindOneResult.Candidate ||
        !requestFindOneResult.Corporate
      ) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      }
      const { question, Corporate, Candidate } = requestFindOneResult;
      response.corporateName = Corporate.name;
      response.candidateName = Candidate.name;
      response.question = question;
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 정보를 불러오는데 실패했습니다.';
    }

    return response;
  };

  static getCorporate = async ({
    requestId,
    userId,
  }: IRequestGetCorporateRequest): Promise<IRequestGetCorporateResponse> => {
    const response: IRequestGetCorporateResponse = {
      ok: false,
      error: '',
      candidateName: '',
      question: '',
      answer: [],
    };

    try {
      // verify requestId with userId
      const userFindOneResult = await UserModel.findOne({
        attributes: ['corporateId'],
        where: { id: userId },
      });
      if (!userFindOneResult) {
        response.error = '사용자 검색 오류입니다.';
        return response;
      }
      const requestFindOnResult = await RequestModel.findOne({
        attributes: ['corporateId', 'question'],
        where: { id: requestId },
      });
      if (!requestFindOnResult) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      }
      if (requestFindOnResult.corporateId !== userFindOneResult.corporateId) {
        response.error = '잘못된 접근입니다';
        return response;
      }
      // find candidate
      const candidateFindOneResult = await CandidateModel.findOne({
        attributes: ['name'],
        where: { requestId },
      });
      if (!candidateFindOneResult) {
        response.error = '지원자 검색 오류입니다.';
        return response;
      }
      // find receiver
      const receiverFindAllResult = await ReceiverModel.findAll({
        attributes: ['id', 'corporateId', 'answer', 'status'],
        where: { requestId },
      });
      if (!receiverFindAllResult) {
        response.error = '평가자 검색 오류입니다.';
        return response;
      }
      for (const { id, corporateId, answer, status } of receiverFindAllResult) {
        const corporateFindOneResult = await CorporateModel.findOne({
          attributes: ['name'],
          where: { id: corporateId },
        });
        if (!corporateFindOneResult) continue;
        response.answer.push({
          id,
          corporateName: corporateFindOneResult.name,
          answer,
          status,
        });
      }
      response.question = requestFindOnResult.question;
      response.candidateName = candidateFindOneResult.name;
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 정보를 불러오는데 실패했습니다.';
    }

    return response;
  };

  static getCandidate = async ({
    requestId,
    candidateId,
  }: IRequestGetCandidateRequest): Promise<IRequestGetCandidateResponse> => {
    const response: IRequestGetCandidateResponse = {
      ok: false,
      error: '',
      corporateName: '',
      career: [],
    };
    try {
      // find corporate name
      const requestFindOneResult = await RequestModel.findOne({
        attributes: [],
        where: { id: requestId },
        include: {
          model: CorporateModel,
          attributes: ['name'],
        },
      });
      if (!requestFindOneResult || !requestFindOneResult.Corporate) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      }
      // verify requestId with candidateId and find candidateAgree
      const candidateAgreeFindAllResult = await CandidateAgreeModel.findAll({
        attributes: ['corporateId', 'department', 'startAt', 'endAt'],
        where: { requestId, candidateId },
      });
      if (!candidateAgreeFindAllResult) {
        response.error = '지원자 경력 검색 오류입니다.';
        return response;
      }
      for (const {
        corporateId,
        department,
        startAt,
        endAt,
      } of candidateAgreeFindAllResult) {
        const corporateFindOneResult = await CorporateModel.findOne({
          attributes: ['id', 'name'],
          where: { id: corporateId },
        });
        if (!corporateFindOneResult) continue;
        response.career.push({
          corporateId: corporateFindOneResult.id,
          corporateName: corporateFindOneResult.name,
          department,
          startAt,
          endAt,
        });
      }
      response.corporateName = requestFindOneResult.Corporate.name;
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 정보를 불러오는데 실패했습니다.';
    }

    return response;
  };

  static listReceiver = async ({
    userId,
  }: IRequestListReceiverRequest): Promise<IRequestListReceiverResponse> => {
    const response: IRequestListReceiverResponse = {
      ok: false,
      error: '',
      request: [],
    };

    try {
      const receiverFindAllResult = await ReceiverModel.findAll({
        attributes: ['requestId', 'status'],
        where: { userId },
      });
      if (!receiverFindAllResult) {
        response.error = '요청 검색 오류입니다.';
        return response;
      }
      for (const { requestId, status } of receiverFindAllResult) {
        const requestFindOneResult = await RequestModel.findOne({
          attributes: ['id'],
          where: { id: requestId },
          include: [
            {
              model: CandidateModel,
              attributes: ['name'],
            },
            {
              model: CorporateModel,
              attributes: ['name'],
            },
          ],
        });
        if (
          !requestFindOneResult ||
          !requestFindOneResult.Candidate ||
          !requestFindOneResult.Corporate
        )
          continue;
        response.request.push({
          id: requestFindOneResult.id,
          corporateName: requestFindOneResult.Corporate.name,
          candidateName: requestFindOneResult.Candidate.name,
          status,
        });
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 목록을 불러오는데 실패했습니다.';
    }

    return response;
  };

  static listCorporate = async ({
    userId,
  }: IRequestListCorporateRequest): Promise<IRequestListCorporateResponse> => {
    const response: IRequestListCorporateResponse = {
      ok: false,
      error: '',
      request: [],
    };

    try {
      // find user
      const userFindOneResult = await UserModel.findOne({
        attributes: ['corporateId'],
        where: { id: userId },
      });
      if (!userFindOneResult) {
        response.error = '사용자 검색 오류입니다.';
        return response;
      }
      // find request and candidate
      const requestFindAllResult = await RequestModel.findAll({
        attributes: ['id', 'status'],
        where: { corporateId: userFindOneResult.corporateId },
        include: [
          {
            model: CandidateModel,
            attributes: ['name'],
          },
        ],
      });
      if (!requestFindAllResult) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      }
      // find receiver and push request
      for (const { id, status, Candidate } of requestFindAllResult) {
        if (!Candidate) continue;
        const request: ICorporateRequest = {
          id,
          status,
          candidateName: Candidate.name,
          receiver: [],
        };
        const receiverFindAllResult = await ReceiverModel.findAll({
          attributes: ['id', 'status'],
          where: { requestId: id },
        });
        if (!receiverFindAllResult) {
          response.error = '평가자 검색 오류입니다.';
          return response;
        }
        for (const { id, status } of receiverFindAllResult) {
          request.receiver.push({ id, status });
        }
        response.request.push(request);
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 목록을 불러오는데 실패했습니다.';
    }

    return response;
  };

  static listCandidate = async ({
    candidateId,
  }: IRequestListCandidateRequest): Promise<IRequestListCandidateResponse> => {
    const response: IRequestListCandidateResponse = {
      ok: false,
      error: '',
      request: [],
    };

    try {
      // find candidate's name and phone
      const candidateFindOneResult = await CandidateModel.findOne({
        attributes: ['name', 'phone'],
        where: { id: candidateId },
      });
      if (!candidateFindOneResult) {
        response.error = '지원자 검색 오류입니다.';
        return response;
      }
      // find request for the candidate
      const { name, phone } = candidateFindOneResult;
      const requestFindAllResult = await RequestModel.findAll({
        attributes: ['id', 'status'],
        include: [
          { model: CandidateModel, attributes: [], where: { name, phone } },
          { model: CorporateModel, attributes: ['name'] },
        ],
      });
      if (!requestFindAllResult) {
        response.error = '지원자 의뢰 검색 오류입니다.';
        return response;
      }
      for (const { id, status, Corporate } of requestFindAllResult) {
        if (!Corporate) continue;
        response.request.push({
          id,
          corporateName: Corporate.name,
          status,
        });
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 목록을 불러오는데 실패했습니다.';
    }

    return response;
  };

  static agree = async ({
    candidateId,
    requestId,
    agree,
    agreeDescription,
  }: IRequestAgreeRequest): Promise<IRequestAgreeResponse> => {
    const response: IRequestAgreeResponse = {
      ok: false,
      error: '',
    };

    try {
      // verify candidateId with request
      const requestFindOneResult = await RequestModel.findOne({
        attributes: ['status'],
        where: { id: requestId },
        include: {
          model: CandidateModel,
          attributes: ['id'],
        },
      });
      if (!requestFindOneResult || !requestFindOneResult.Candidate) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      }
      if (requestFindOneResult.Candidate.id !== candidateId) {
        response.error = '지원자 오류입니다.';
        return response;
      }
      if (requestFindOneResult.status !== 'registered') {
        response.error = '의뢰 상태 오류입니다.';
        return response;
      }
      for (const { corporateId, agreed } of agree) {
        // update candidateAgree
        if (!agreed) continue;
        const candidateAgreeUpdateResult = await CandidateAgreeModel.update(
          { agreedAt: new Date() },
          { where: { requestId, corporateId } }
        );
        if (!candidateAgreeUpdateResult) {
          response.error = '지원자 동의 업데이트 오류입니다.';
          return response;
        }
        // find career
        const corporateFindAllResult = await CorporateModel.findAll({
          attributes: [],
          where: {},
          include: [
            {
              model: CandidateAgreeModel,
              as: 'CandidateAgree',
              attributes: [],
              where: { requestId, corporateId },
            },
            {
              model: CareerModel,
              attributes: ['userId'],
              where: {
                [Op.or]: [
                  Sequelize.literal(
                    'Career.startAt BETWEEN CandidateAgree.startAt AND CandidateAgree.endAt'
                  ),
                  Sequelize.literal(
                    'CandidateAgree.startAt BETWEEN Career.startAt AND Career.endAt'
                  ),
                ],
              },
            },
          ],
        });
        // create receiver
        if (!corporateFindAllResult) continue;
        for (const { Career } of corporateFindAllResult) {
          const receiverCreateResult = await ReceiverModel.create({
            userId: Career!.userId,
            corporateId,
            requestId,
          });
        }
      }
      // update request
      const requestUpdateResult = await RequestModel.update(
        { agreeDescription, status: 'agreed' },
        { where: { id: requestId } }
      );
      if (!requestUpdateResult) {
        response.error = '의뢰 정보 업데이트 오류입니다.';
        return response;
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '지원자 동의에 실패했습니다.';
    }

    return response;
  };

  static verify = async ({
    requestId,
    userId,
    candidatePhone,
  }: IRequestVerifyRequest): Promise<IRequestVerifyResponse> => {
    const response: IRequestVerifyResponse = {
      ok: false,
      error: '',
    };

    try {
      // verify user, request, and receiver status
      const requestFindOneResult = await RequestModel.findOne({
        attributes: ['status'],
        where: { id: requestId },
        include: [
          {
            model: ReceiverModel,
            attributes: ['id', 'userId', 'status'],
          },
          {
            model: CandidateModel,
            attributes: ['phone'],
          },
        ],
      });
      if (
        !requestFindOneResult ||
        !requestFindOneResult.Receiver ||
        !requestFindOneResult.Candidate
      ) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      }
      if (requestFindOneResult.Receiver.userId !== userId) {
        response.error = '평가자 오류입니다.';
        return response;
      }
      if (
        requestFindOneResult.status !== 'agreed' ||
        requestFindOneResult.Receiver.status !== 'arrived'
      ) {
        response.error = '의뢰 상태 오류입니다.';
        return response;
      }
      if (requestFindOneResult.Candidate.phone !== candidatePhone) {
        response.error = '지원자 정보가 올바르지 않습니다.';
        return response;
      }
      // update receiver status and verifiedAt
      const receiverUpdateResult = await ReceiverModel.update(
        {
          verifiedAt: new Date(),
          status: 'verified',
        },
        { where: { id: requestFindOneResult.Receiver.id } }
      );
      if (!receiverUpdateResult) {
        response.error = '의뢰 상태 업데이트 오류입니다.';
        return response;
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 답변 검증에 실패했습니다.';
    }

    return response;
  };

  static answer = async ({
    requestId,
    userId,
    answer,
  }: IRequestAnswerRequest): Promise<IRequestAnswerResponse> => {
    const response: IRequestAnswerResponse = {
      ok: false,
      error: '',
    };

    try {
      // verify user, request and receiver status
      const requestFindOneResult = await RequestModel.findOne({
        attributes: ['status'],
        where: { id: requestId },
        include: {
          model: ReceiverModel,
          attributes: ['id', 'userId', 'status'],
        },
      });
      if (!requestFindOneResult || !requestFindOneResult.Receiver) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      }
      if (requestFindOneResult.Receiver.userId !== userId) {
        response.error = '평가자 오류입니다.';
        return response;
      }
      if (
        requestFindOneResult.status !== 'agreed' ||
        requestFindOneResult.Receiver.status !== 'verified'
      ) {
        response.error = '의뢰 상태 오류입니다.';
        return response;
      }
      // update receiver status
      const receiverUpdateResult = await ReceiverModel.update(
        {
          answer,
          status: 'answered',
          answeredAt: new Date(),
        },
        { where: { id: requestFindOneResult.Receiver.id } }
      );
      if (!receiverUpdateResult) {
        response.error = '의뢰 상태 업데이트 오류입니다.';
        return response;
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 답변에 실패했습니다.';
    }

    return response;
  };

  static reject = async ({
    requestId,
    userId,
  }: IRequestRejectRequest): Promise<IRequestRejectResponse> => {
    const response: IRequestRejectResponse = {
      ok: false,
      error: '',
    };

    try {
      // verify requestId with userId
      const requestFindOneResult = await RequestModel.findOne({
        attributes: ['status'],
        where: { id: requestId },
        include: {
          model: ReceiverModel,
          attributes: ['id', 'userId', 'status'],
        },
      });
      if (!requestFindOneResult || !requestFindOneResult.Receiver) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      }
      if (requestFindOneResult.Receiver.userId !== userId) {
        response.error = '평가자 오류입니다.';
        return response;
      }
      if (
        requestFindOneResult.status !== 'agreed' ||
        (requestFindOneResult.Receiver.status !== 'arrived' &&
          requestFindOneResult.Receiver.status !== 'verified')
      ) {
        response.error = '의뢰 상태 오류입니다.';
        return response;
      }
      // update receiver status
      const receiverUpdateResult = await ReceiverModel.update(
        {
          rejectedAt: new Date(),
          status: 'rejected',
        },
        { where: { id: requestFindOneResult.Receiver.id } }
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
  };
}

export default RequestService;
