import {
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
  IRequestUpdateReceiverRequest,
  IRequestUpdateReceiverResponse,
  IRequestGetCorporateAgreeRequest,
  IRequestGetCorporateAgreeResponse,
  IRequestRegisterReferenceRequest,
  IRequestRegisterReferenceResponse,
} from '@services/RequestService/type';
import RequestModel from '@models/RequestModel';
import CorporateModel from '@models/CorporateModel';
import CandidateModel from '@models/CandidateModel';
import CandidateAgreeModel from '@models/CandidateAgreeModel';
import CareerModel from '@models/CareerModel';
import { Op, Sequelize } from 'sequelize';
import ReceiverModel from '@models/ReceiverModel';
import { MAX_TIMESTAMP } from '@constants/date';
import UserModel from '@models/UserModel';
import { ICorporateRequest } from '@controllers/RequestController/type';
import careerModel from '@models/CareerModel';
import { SensSingleton } from '@utils/sens';

class RequestService {
  static async registerReference({
    userId,
    name,
    phone,
    careers,
    question,
    deadline,
  }: IRequestRegisterReferenceRequest): Promise<IRequestRegisterReferenceResponse> {
    const response: IRequestRegisterReferenceResponse = {
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
      // create request
      const createRequestResult = await RequestModel.create({
        corporateId: userFindOneResult.corporateId,
        question,
        deadline: deadline || new Date(MAX_TIMESTAMP),
        type: 'reference',
      });
      if (!createRequestResult) {
        response.error = '의뢰 생성 오류입니다.';
        return response;
      }
      // create candidate
      const createCandidateResult = await CandidateModel.create({
        requestId: createRequestResult.id,
        name,
        phone,
      });
      if (!createCandidateResult) {
        response.error = '지원자 생성 오류입니다.';
        return response;
      }
      // create candidate agree
      for (const { corporateName, department, startAt, endAt } of careers) {
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
      // send agree link to candidate
      const sendMessageResponse = await SensSingleton.sendMessage({
        templateCode: 'agree3',
        messages: [
          {
            to: phone,
            content: `평판 조회 동의 요청이 도착하였습니다. 아래 버튼으로 접속하여 로그인 후 동의를 완료해주세요.`,
            buttons: [
              {
                type: 'WL',
                name: '동의하러 가기',
                linkMobile: 'https://crowdcheck.io/auth/login/candidate',
                linkPc: 'https://crowdcheck.io/auth/login/candidate',
              },
            ],
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
      response.error = '의뢰 등록에 실패했습니다.';
      return response;
    }

    return response;
  }

  static async getReceiver({
    requestId,
    userId,
  }: IRequestGetReceiverRequest): Promise<IRequestGetReceiverResponse> {
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
        attributes: ['id'],
        where: { requestId, userId },
      });
      if (!receiverFindOneResult) {
        response.error = '사용자 검색 오류입니다.';
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
  }

  static async getCorporate({
    requestId,
    userId,
  }: IRequestGetCorporateRequest): Promise<IRequestGetCorporateResponse> {
    const response: IRequestGetCorporateResponse = {
      ok: false,
      error: '',
      candidateName: '',
      question: '',
      answers: [],
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
        response.answers.push({
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
  }

  static async getCorporateAgree({
    requestId,
    userId,
  }: IRequestGetCorporateAgreeRequest): Promise<IRequestGetCorporateAgreeResponse> {
    const response: IRequestGetCorporateAgreeResponse = {
      ok: false,
      error: '',
      candidateName: '',
      agrees: [],
      agreeDescription: null,
    };

    try {
      // find corporate id
      const userFindOneResult = await UserModel.findOne({
        attributes: ['corporateId'],
        where: { id: userId },
      });
      if (!userFindOneResult) {
        response.error = '사용자 검색 오류입니다.';
        return response;
      }
      // find request
      const requestFindOneResult = await RequestModel.findOne({
        attributes: ['agreeDescription'],
        where: { id: requestId, corporateId: userFindOneResult.corporateId },
        include: [
          {
            model: CandidateModel,
            attributes: ['name'],
          },
          {
            model: CandidateAgreeModel,
            attributes: ['corporateId', 'agreedAt'],
          },
        ],
      });
      if (!requestFindOneResult || !requestFindOneResult) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      }
      const { Candidate, CandidateAgrees } = requestFindOneResult;
      if (!Candidate || !CandidateAgrees) {
        response.error = '지원자 검색 오류입니다.';
        return response;
      }
      for (const { corporateId, agreedAt } of CandidateAgrees) {
        // find corporate name
        const corporateFindOneResult = await CorporateModel.findOne({
          attributes: ['name'],
          where: { id: corporateId },
        });
        if (!corporateFindOneResult) continue;
        response.agrees.push({
          corporateId,
          corporateName: corporateFindOneResult.name,
          agreed: agreedAt !== null,
        });
      }
      response.agreeDescription = requestFindOneResult.agreeDescription;
      response.candidateName = Candidate.name;
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 동의 현황을 불러오는데 실패했습니다.';
    }

    return response;
  }

  static async getCandidate({
    requestId,
    candidateId,
  }: IRequestGetCandidateRequest): Promise<IRequestGetCandidateResponse> {
    const response: IRequestGetCandidateResponse = {
      ok: false,
      error: '',
      corporateName: '',
      careers: [],
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
        attributes: ['id', 'corporateId', 'department', 'startAt', 'endAt'],
        where: { requestId, candidateId },
      });
      if (!candidateAgreeFindAllResult) {
        response.error = '지원자 경력 검색 오류입니다.';
        return response;
      }
      for (const {
        id,
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
        response.careers.push({
          id,
          corporateId: corporateFindOneResult.id,
          corporateName: corporateFindOneResult.name,
          department,
          startAt,
          endAt: endAt > new Date() ? null : endAt,
        });
      }
      response.corporateName = requestFindOneResult.Corporate.name;
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 정보를 불러오는데 실패했습니다.';
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
        response.requests.push({
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
          receivers: [],
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
          request.receivers.push({ id, status });
        }
        response.requests.push(request);
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 목록을 불러오는데 실패했습니다.';
    }

    return response;
  }

  static async listCandidate({
    candidateId,
  }: IRequestListCandidateRequest): Promise<IRequestListCandidateResponse> {
    const response: IRequestListCandidateResponse = {
      ok: false,
      error: '',
      requests: [],
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
        response.requests.push({
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
  }

  static async agree({
    candidateId,
    requestId,
    agrees,
    agreeDescription,
  }: IRequestAgreeRequest): Promise<IRequestAgreeResponse> {
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
      for (const { corporateId, agreed } of agrees) {
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
              attributes: [],
              where: { requestId, corporateId },
            },
            {
              model: CareerModel,
              attributes: ['userId'],
              where: {
                [Op.or]: [
                  Sequelize.literal(
                    'Careers.startAt BETWEEN CandidateAgrees.startAt AND CandidateAgrees.endAt'
                  ),
                  Sequelize.literal(
                    'CandidateAgrees.startAt BETWEEN Careers.startAt AND Careers.endAt'
                  ),
                ],
              },
            },
          ],
        });
        // create receiver
        if (!corporateFindAllResult) continue;
        for (const { Careers } of corporateFindAllResult) {
          if (!Careers) continue;
          for (const Career of Careers) {
            if (!Career) continue;
            const receiverCreateResult = await ReceiverModel.create({
              userId: Career.userId,
              corporateId,
              requestId,
            });
            if (!receiverCreateResult) continue;
            // find user
            const userFindOneResult = await UserModel.findOne({
              attributes: ['phone'],
              where: { id: Career.userId },
            });
            if (!userFindOneResult) continue;
            // send alarm
            const sendMessageResponse = await SensSingleton.sendMessage({
              templateCode: 'receive2',
              messages: [
                {
                  to: userFindOneResult.phone,
                  content: `새로운 의뢰가 도착하였습니다.\n\n(해당 의뢰 알림 메시지는 회원 님의 알림 신청에 의해 발송됩니다.)`,
                  buttons: [
                    {
                      type: 'WL',
                      name: '답변하러 가기',
                      linkMobile: 'https://crowdcheck.io',
                      linkPc: 'https://crowdcheck.io',
                    },
                  ],
                },
              ],
            });
          }
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
  }

  static async verify({
    requestId,
    userId,
    candidatePhone,
  }: IRequestVerifyRequest): Promise<IRequestVerifyResponse> {
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
            attributes: ['id', 'status', 'corporateId'],
            where: { userId },
          },
          {
            model: CandidateModel,
            attributes: ['phone'],
          },
        ],
      });
      if (
        !requestFindOneResult ||
        !requestFindOneResult.Receivers ||
        !requestFindOneResult.Candidate
      ) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      } else if (!requestFindOneResult.Receivers[0]) {
        response.error = '평가자 오류입니다.';
        return response;
      } else if (
        requestFindOneResult.status !== 'agreed' ||
        requestFindOneResult.Receivers[0].status !== 'arrived'
      ) {
        response.error = '의뢰 상태 오류입니다.';
        return response;
      } else if (requestFindOneResult.Candidate.phone !== candidatePhone) {
        response.error = '지원자 정보가 올바르지 않습니다.';
        return response;
      }
      // verify career status
      const careerFindOneResult = await careerModel.findOne({
        attributes: ['verifiedAt'],
        where: {
          userId,
          corporateId: requestFindOneResult.Receivers[0].corporateId,
        },
      });
      if (!careerFindOneResult) {
        response.error = '경력 검색 오류입니다.';
        return response;
      } else if (careerFindOneResult.verifiedAt) {
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
      response.error = '의뢰 답변 검증에 실패했습니다.';
    }

    return response;
  }

  static async answer({
    requestId,
    userId,
    answer,
  }: IRequestAnswerRequest): Promise<IRequestAnswerResponse> {
    const response: IRequestAnswerResponse = {
      ok: false,
      error: '',
    };

    try {
      // verify user, request and receiver status
      const requestFindOneResult = await RequestModel.findOne({
        attributes: ['status', 'corporateId'],
        where: { id: requestId },
        include: {
          model: ReceiverModel,
          attributes: ['id', 'status'],
          where: { userId },
        },
      });
      if (!requestFindOneResult || !requestFindOneResult.Receivers) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      }
      if (!requestFindOneResult.Receivers[0]) {
        response.error = '평가자 오류입니다.';
        return response;
      }
      if (
        requestFindOneResult.status !== 'agreed' ||
        requestFindOneResult.Receivers[0].status !== 'verified'
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
        { where: { id: requestFindOneResult.Receivers[0].id } }
      );
      if (!receiverUpdateResult) {
        response.error = '의뢰 상태 업데이트 오류입니다.';
        return response;
      }
      // find corporate phone
      const userFindOneResult = await UserModel.findOne({
        attributes: ['phone'],
        where: { id: requestFindOneResult.corporateId },
      });
      if (!userFindOneResult) {
        response.error = '기업 검색 오류입니다.';
        return response;
      }
      // send alarm
      const sendMessageResponse = await SensSingleton.sendMessage({
        templateCode: 'answer2',
        messages: [
          {
            to: userFindOneResult.phone,
            content: `새로운 답변이 등록되었습니다.\n\n(해당 답변 알림 메시지는 회원 님의 알림 신청에 의해 발송됩니다.)`,
            buttons: [
              {
                type: 'WL',
                name: '확인하러 가기',
                linkMobile: 'https://crowdcheck.io',
                linkPc: 'https://crowdcheck.io',
              },
            ],
          },
        ],
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
  }: IRequestRejectRequest): Promise<IRequestRejectResponse> {
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
          attributes: ['id', 'status'],
          where: { userId },
        },
      });
      if (!requestFindOneResult || !requestFindOneResult.Receivers) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      }
      if (!requestFindOneResult.Receivers[0]) {
        response.error = '평가자 오류입니다.';
        return response;
      }
      if (
        requestFindOneResult.status !== 'agreed' ||
        (requestFindOneResult.Receivers[0].status !== 'arrived' &&
          requestFindOneResult.Receivers[0].status !== 'verified')
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
        attributes: ['corporateId'],
        where: { userId },
      });
      if (!careerFindAllResult) {
        response.error = '경력 검색 오류입니다.';
        return response;
      }
      for (const { corporateId } of careerFindAllResult) {
        // find requests
        const requestFindAllResult = await RequestModel.findAll({
          attributes: ['id'],
          where: { status: { [Op.not]: 'closed' } },
          include: {
            model: CandidateAgreeModel,
            attributes: ['id'],
            where: { corporateId, agreedAt: { [Op.not]: null } },
          },
        });
        if (!requestFindAllResult) continue;
        for (const { id } of requestFindAllResult) {
          // find or create receiver
          const receiverFindOrCreateResult = await ReceiverModel.findOrCreate({
            attributes: ['id'],
            where: { requestId: id, userId },
            defaults: {
              requestId: id,
              corporateId,
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
            templateCode: 'receive2',
            messages: [
              {
                to: userFindOneResult.phone,
                content: `새로운 의뢰가 도착하였습니다.\n\n(해당 의뢰 알림 메시지는 회원 님의 알림 신청에 의해 발송됩니다.)`,
                buttons: [
                  {
                    type: 'WL',
                    name: '답변하러 가기',
                    linkMobile: 'https://crowdcheck.io',
                    linkPc: 'https://crowdcheck.io',
                  },
                ],
              },
            ],
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

export default RequestService;
