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
      if (!requestFindOneResult) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      }
      const { question, Corporate, Candidate } = requestFindOneResult;
      response.corporateName = Corporate!.name;
      response.candidateName = Candidate!.name;
      response.question = question;
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
      if (!requestFindOneResult) {
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
        if (!corporateFindOneResult) {
          response.error = '기업 검색 오류입니다.';
          return response;
        }
        response.career.push({
          corporateId: corporateFindOneResult.id,
          corporateName: corporateFindOneResult.name,
          department,
          startAt,
          endAt,
        });
      }
      response.corporateName = requestFindOneResult.Corporate!.name;
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
      const requestFindAllResult = await RequestModel.findAll({
        attributes: ['id'],
        include: [
          {
            model: ReceiverModel,
            attributes: ['status'],
            where: { userId },
          },
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
      if (!requestFindAllResult) {
        response.error = '의뢰 목록 검색 오류입니다.';
      }
      for (const {
        id,
        Receiver,
        Candidate,
        Corporate,
      } of requestFindAllResult) {
        response.request.push({
          id,
          corporateName: Corporate!.name,
          candidateName: Candidate!.name,
          status: Receiver!.status,
        });
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 목록 검색에 실패했습니다.';
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
        response.request.push({
          id,
          corporateName: Corporate!.name,
          status,
        });
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '지원자 의뢰 목록 검색에 실패했습니다.';
    }

    return response;
  };

  static agree = async ({
    requestId,
    agree,
    agreeDescription,
  }: IRequestAgreeRequest): Promise<IRequestAgreeResponse> => {
    const response: IRequestAgreeResponse = {
      ok: false,
      error: '',
    };

    try {
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
      // verify receiver status
      const receiverFindOneResult = await ReceiverModel.findOne({
        attributes: ['id', 'status'],
        where: {
          requestId,
          userId,
        },
      });
      if (!receiverFindOneResult) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      }
      if (receiverFindOneResult.status !== 'arrived') {
        response.error = '의뢰 상태 오류입니다.';
        return response;
      }
      // verify candidate phone
      const requestFindOneResult = await RequestModel.findOne({
        attributes: [],
        where: { id: requestId },
        include: {
          model: CandidateModel,
          attributes: ['phone'],
        },
      });
      if (!requestFindOneResult) {
        response.error = '지원자 검색 오류입니다.';
        return response;
      }
      if (requestFindOneResult.Candidate!.phone !== candidatePhone) {
        response.error = '지원자 정보가 올바르지 않습니다.';
        return response;
      }
      // update receiver status and verifiedAt
      const receiverUpdateResult = await ReceiverModel.update(
        {
          status: 'verified',
          verifiedAt: new Date(),
        },
        { where: { id: receiverFindOneResult.id } }
      );
      if (!receiverUpdateResult) {
        response.error = '의뢰 수신 상태 업데이트 오류입니다.';
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
      // verify receiver status
      const receiverFindOneResult = await ReceiverModel.findOne({
        attributes: ['id', 'status'],
        where: { requestId, userId },
      });
      if (!receiverFindOneResult) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      }
      if (receiverFindOneResult.status !== 'verified') {
        response.error = '검증할 수 없는 의뢰입니다.';
        return response;
      }
      // update receiver status
      const receiverUpdateResult = await ReceiverModel.update(
        {
          answer,
          status: 'answered',
          answeredAt: new Date(),
        },
        { where: { id: receiverFindOneResult.id } }
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
}

export default RequestService;
