import {
  IRequestReferenceGetCandidateRequest,
  IRequestReferenceGetCandidateResponse,
  IRequestReferenceListCandidateRequest,
  IRequestReferenceListCandidateResponse,
  IRequestReferenceAgreeRequest,
  IRequestReferenceAgreeResponse,
  IRequestReferenceListReceiverRequest,
  IRequestReferenceListReceiverResponse,
  IRequestReferenceVerifyRequest,
  IRequestReferenceVerifyResponse,
  IRequestReferenceGetReceiverRequest,
  IRequestReferenceGetReceiverResponse,
  IRequestReferenceAnswerRequest,
  IRequestReferenceAnswerResponse,
  IRequestReferenceListCorporateRequest,
  IRequestReferenceListCorporateResponse,
  IRequestReferenceGetCorporateRequest,
  IRequestReferenceGetCorporateResponse,
  IRequestRejectRequest,
  IRequestRejectResponse,
  IRequestReferenceUpdateReceiverRequest,
  IRequestReferenceUpdateReceiverResponse,
  IRequestReferenceGetCorporateAgreeRequest,
  IRequestReferenceGetCorporateAgreeResponse,
  IRequestReferenceRegisterRequest,
  IRequestReferenceRegisterResponse,
  IRequestResumeRegisterRequest,
  IRequestResumeRegisterResponse,
  IRequestResumeListCorporateRequest,
  IRequestResumeListCorporateResponse,
  IRequestResumeListExpertRequest,
  IRequestResumeListExpertResponse,
  IRequestResumeExploreRequest,
  IRequestResumeExploreResponse,
  IRequestResumeDetailExpertRequest,
  IRequestResumeDetailExpertResponse,
  IRequestResumeGetAnswerExpertRequest,
  IRequestResumeGetAnswerExpertResponse,
  IRequestResumeAnswerRequest,
  IRequestResumeAnswerResponse,
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
import {
  IRequestReferenceCorporate,
  IRequestResumeCorporate,
} from '@controllers/RequestController/type';
import careerModel from '@models/CareerModel';
import { SensSingleton } from '@utils/sens';
import CandidateResumeModel from '@models/CandidateResumeModel';
import ExpertModel from '@models/ExpertModel';
import { S3Singleton } from '@utils/s3';
import candidateResumeModel from '@models/CandidateResumeModel';
import CandidatePortfolioModel from '@models/CandidatePortfolioModel';
import candidatePortfolioModel from '@models/CandidatePortfolioModel';
import ReceiverAnswerModel from '@models/ReceiverAnswerModel';

class RequestService {
  static async referenceRegister({
    userId,
    name,
    phone,
    careers,
    question,
    deadline,
  }: IRequestReferenceRegisterRequest): Promise<IRequestReferenceRegisterResponse> {
    const response: IRequestReferenceRegisterResponse = {
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

  static async referenceGetReceiver({
    requestId,
    userId,
  }: IRequestReferenceGetReceiverRequest): Promise<IRequestReferenceGetReceiverResponse> {
    const response: IRequestReferenceGetReceiverResponse = {
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
        where: { id: requestId, type: 'reference' },
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

  static async referenceGetCorporate({
    requestId,
    userId,
  }: IRequestReferenceGetCorporateRequest): Promise<IRequestReferenceGetCorporateResponse> {
    const response: IRequestReferenceGetCorporateResponse = {
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
        where: { id: requestId, type: 'reference' },
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

  static async referenceGetCorporateAgree({
    requestId,
    userId,
  }: IRequestReferenceGetCorporateAgreeRequest): Promise<IRequestReferenceGetCorporateAgreeResponse> {
    const response: IRequestReferenceGetCorporateAgreeResponse = {
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
        where: {
          id: requestId,
          corporateId: userFindOneResult.corporateId,
          type: 'reference',
        },
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

  static async referenceGetCandidate({
    requestId,
    candidateId,
  }: IRequestReferenceGetCandidateRequest): Promise<IRequestReferenceGetCandidateResponse> {
    const response: IRequestReferenceGetCandidateResponse = {
      ok: false,
      error: '',
      corporateName: '',
      careers: [],
    };
    try {
      // find corporate name
      const requestFindOneResult = await RequestModel.findOne({
        attributes: [],
        where: { id: requestId, type: 'reference' },
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

  static async referenceListReceiver({
    userId,
  }: IRequestReferenceListReceiverRequest): Promise<IRequestReferenceListReceiverResponse> {
    const response: IRequestReferenceListReceiverResponse = {
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
          where: { id: requestId, type: 'reference' },
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

  static async referenceListCorporate({
    userId,
  }: IRequestReferenceListCorporateRequest): Promise<IRequestReferenceListCorporateResponse> {
    const response: IRequestReferenceListCorporateResponse = {
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
        where: {
          corporateId: userFindOneResult.corporateId,
          type: 'reference',
        },
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
        const request: IRequestReferenceCorporate = {
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

  static async referenceListCandidate({
    candidateId,
  }: IRequestReferenceListCandidateRequest): Promise<IRequestReferenceListCandidateResponse> {
    const response: IRequestReferenceListCandidateResponse = {
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
        where: { type: 'reference' },
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

  static async referenceAgree({
    candidateId,
    requestId,
    agrees,
    agreeDescription,
  }: IRequestReferenceAgreeRequest): Promise<IRequestReferenceAgreeResponse> {
    const response: IRequestReferenceAgreeResponse = {
      ok: false,
      error: '',
    };

    try {
      // verify candidateId with request
      const requestFindOneResult = await RequestModel.findOne({
        attributes: ['status'],
        where: { id: requestId, type: 'reference' },
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
        { where: { id: requestId, type: 'reference' } }
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

  static async referenceVerify({
    requestId,
    userId,
    candidatePhone,
  }: IRequestReferenceVerifyRequest): Promise<IRequestReferenceVerifyResponse> {
    const response: IRequestReferenceVerifyResponse = {
      ok: false,
      error: '',
    };

    try {
      // verify user, request, and receiver status
      const requestFindOneResult = await RequestModel.findOne({
        attributes: ['status'],
        where: { id: requestId, type: 'reference' },
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

  static async referenceAnswer({
    requestId,
    userId,
    answer,
  }: IRequestReferenceAnswerRequest): Promise<IRequestReferenceAnswerResponse> {
    const response: IRequestReferenceAnswerResponse = {
      ok: false,
      error: '',
    };

    try {
      // verify user, request and receiver status
      const requestFindOneResult = await RequestModel.findOne({
        attributes: ['status', 'corporateId'],
        where: { id: requestId, type: 'reference' },
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

  static async referenceReject({
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
        where: { id: requestId, type: 'reference' },
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

  static async referenceUpdateReceiver({
    userId,
  }: IRequestReferenceUpdateReceiverRequest): Promise<IRequestReferenceUpdateReceiverResponse> {
    const response: IRequestReferenceUpdateReceiverResponse = {
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
          where: { status: { [Op.not]: 'closed' }, type: 'reference' },
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

  /*
    Resume
   */

  static async resumeRegister({
    userId,
    memo,
    resume,
    portfolio,
    specialty,
    question,
    deadline,
    rewardNum,
    rewardPrice,
  }: IRequestResumeRegisterRequest): Promise<IRequestResumeRegisterResponse> {
    const response: IRequestResumeRegisterResponse = {
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
        memo,
        specialty,
        question,
        deadline: deadline || new Date(MAX_TIMESTAMP),
        rewardNum,
        rewardPrice,
        type: 'resume',
      });
      if (!createRequestResult || !createRequestResult.id) {
        response.error = '의뢰 생성 오류입니다.';
        return response;
      }
      // create candidate resume
      const candidateResumeCreateResult = await CandidateResumeModel.create({
        requestId: createRequestResult.id,
        resumeBucket: resume.bucket,
        resumeKey: resume.key,
      });
      if (!candidateResumeCreateResult) {
        response.error = '이력서 생성 오류입니다.';
        return response;
      }
      // create candidate portfolio
      if (portfolio) {
        const candidatePortfolioCreateResult =
          await CandidatePortfolioModel.create({
            requestId: createRequestResult.id,
            portfolioBucket: portfolio.bucket,
            portfolioKey: portfolio.key,
          });
        if (!candidatePortfolioCreateResult) {
          response.error = '포트폴리오 생성 오류입니다.';
          return response;
        }
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 등록에 실패했습니다.';
      return response;
    }

    return response;
  }

  static async resumeListCorporate({
    userId,
  }: IRequestResumeListCorporateRequest): Promise<IRequestResumeListCorporateResponse> {
    const response: IRequestResumeListCorporateResponse = {
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
      // find request
      const requestFindAllResult = await RequestModel.findAll({
        attributes: ['id', 'status', 'memo'],
        where: { corporateId: userFindOneResult.corporateId, type: 'resume' },
      });
      if (!requestFindAllResult) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      }
      // find receiver and push request
      for (const { id, status, memo } of requestFindAllResult) {
        const request: IRequestResumeCorporate = {
          id,
          status,
          memo,
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

  static async resumeListExpert({
    userId,
  }: IRequestResumeListExpertRequest): Promise<IRequestResumeListExpertResponse> {
    const response: IRequestResumeListExpertResponse = {
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
          attributes: ['id', 'deadline', 'rewardNum', 'rewardPrice'],
          where: { id: requestId, type: 'resume' },
          include: [
            {
              model: CorporateModel,
              attributes: ['name'],
            },
          ],
        });
        // count receiver
        const receiverCountResult = await ReceiverModel.count({
          where: { requestId },
        });
        if (!requestFindOneResult || !requestFindOneResult.Corporate) continue;
        // generate response
        const { deadline, rewardNum, rewardPrice, Corporate } =
          requestFindOneResult;
        response.requests.push({
          id: requestFindOneResult.id,
          corporateName: Corporate.name,
          deadline:
            deadline && deadline.getTime() === new Date(MAX_TIMESTAMP).getTime()
              ? null
              : deadline,
          rewardNum,
          rewardPrice,
          receiverCount: receiverCountResult ?? 0,
        });
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 목록을 불러오는데 실패했습니다.';
    }

    return response;
  }

  static async resumeExplore({
    userId,
    page,
  }: IRequestResumeExploreRequest): Promise<IRequestResumeExploreResponse> {
    const response: IRequestResumeExploreResponse = {
      ok: false,
      error: '',
      requests: [],
    };

    try {
      // verify user is expert
      const expertFindOneResult = await ExpertModel.findOne({
        attributes: ['specialty'],
        where: { userId },
      });
      if (!expertFindOneResult) {
        response.error = '사용자 검색 오류입니다.';
        return response;
      }
      // find request
      const requestFindAllResult = await RequestModel.findAll({
        attributes: ['id', 'deadline', 'rewardNum', 'rewardPrice'],
        where: {
          type: 'resume',
          status: { [Op.not]: 'closed' },
          specialty: expertFindOneResult.specialty,
        },
        order: [['deadline', 'ASC']],
        offset: 20 * (page - 1),
        limit: 20,
        include: [
          {
            model: CorporateModel,
            attributes: ['name'],
          },
        ],
      });
      if (!requestFindAllResult) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      }
      // generate response
      for (const {
        id,
        deadline,
        rewardNum,
        rewardPrice,
        Corporate,
      } of requestFindAllResult) {
        if (!Corporate) continue;
        // count receiver
        const receiverCountResult = await ReceiverModel.count({
          where: { requestId: id },
        });
        response.requests.push({
          id,
          corporateName: Corporate.name,
          deadline:
            deadline && deadline.getTime() === new Date(MAX_TIMESTAMP).getTime()
              ? null
              : deadline,
          rewardNum,
          rewardPrice,
          receiverCount: receiverCountResult ?? 0,
        });
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 탐색에 실패했습니다.';
    }

    return response;
  }

  static async resumeDetailExpert({
    userId,
    requestId,
  }: IRequestResumeDetailExpertRequest): Promise<IRequestResumeDetailExpertResponse> {
    const response: IRequestResumeDetailExpertResponse = {
      ok: false,
      error: '',
      request: null,
    };

    try {
      // verify expert
      const expertFindOneResult = await ExpertModel.findOne({
        attributes: ['specialty'],
        where: { userId },
      });
      if (!expertFindOneResult) {
        response.error = '전문가 검색 오류입니다.';
        return response;
      }
      // find request
      const requestFindOneResult = await RequestModel.findOne({
        attributes: [
          'id',
          'question',
          'deadline',
          'rewardNum',
          'rewardPrice',
          'status',
        ],
        where: {
          id: requestId,
          type: 'resume',
          specialty: expertFindOneResult.specialty,
        },
        include: [
          {
            model: CorporateModel,
            attributes: ['name'],
          },
        ],
      });
      if (!requestFindOneResult || !requestFindOneResult.Corporate) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      }
      const {
        id,
        question,
        deadline,
        rewardNum,
        rewardPrice,
        status,
        Corporate,
      } = requestFindOneResult;
      // count receiver
      const receiverCountResult = await ReceiverModel.count({
        where: { requestId },
      });
      response.request = {
        id,
        corporateName: Corporate.name,
        question,
        deadline:
          deadline && deadline.getTime() === new Date(MAX_TIMESTAMP).getTime()
            ? null
            : deadline,
        rewardNum,
        rewardPrice,
        receiverCount: receiverCountResult ?? 0,
        status,
      };
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 조회에 실패했습니다.';
    }

    return response;
  }

  static async resumeGetAnswerExpert({
    userId,
    requestId,
  }: IRequestResumeGetAnswerExpertRequest): Promise<IRequestResumeGetAnswerExpertResponse> {
    const response: IRequestResumeGetAnswerExpertResponse = {
      ok: false,
      error: '',
      request: null,
    };

    try {
      // verify expert
      const expertFindOneResult = await ExpertModel.findOne({
        attributes: ['specialty'],
        where: { userId },
      });
      if (!expertFindOneResult) {
        response.error = '전문가 검색 오류입니다.';
        return response;
      }
      // find receiver
      const receiverFineOneResult = await ReceiverModel.findOne({
        attributes: ['id'],
        where: { requestId, userId },
      });
      if (receiverFineOneResult) {
        response.error = '이미 답변하신 의뢰입니다.';
        return response;
      }
      // find request
      const requestFindOneResult = await RequestModel.findOne({
        attributes: ['id', 'question', 'status'],
        where: {
          id: requestId,
          type: 'resume',
          specialty: expertFindOneResult.specialty,
        },
        include: [
          {
            model: CorporateModel,
            attributes: ['name'],
          },
          {
            model: CandidateResumeModel,
            attributes: ['resumeBucket', 'resumeKey'],
          },
          {
            model: CandidatePortfolioModel,
            attributes: ['portfolioBucket', 'portfolioKey'],
          },
        ],
      });
      if (
        !requestFindOneResult ||
        !requestFindOneResult.Corporate ||
        !requestFindOneResult.CandidateResume
      ) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      } else if (requestFindOneResult.status !== 'registered') {
        response.error = '이미 마감된 의뢰입니다.';
        return response;
      }
      // generate response
      const { id, question, Corporate, CandidateResume, CandidatePortfolio } =
        requestFindOneResult;
      response.request = {
        id,
        corporateName: Corporate.name,
        question,
        resumeUrl: S3Singleton.getSignedUrl(
          CandidateResume?.resumeBucket,
          CandidateResume?.resumeKey
        ),
        portfolioUrl: CandidatePortfolio
          ? S3Singleton.getSignedUrl(
              CandidatePortfolio.portfolioBucket,
              CandidatePortfolio.portfolioKey
            )
          : null,
      };
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 정보 불러오기에 실패했습니다.';
    }

    return response;
  }

  static async resumeAnswer({
    userId,
    requestId,
    workExperience,
    workExperienceDescription,
    roleFit,
    roleFitDescription,
    collaborationAbility,
    collaborationAbilityDescription,
    hardWorking,
    hardWorkingDescription,
    recommendedSalary,
  }: IRequestResumeAnswerRequest): Promise<IRequestResumeAnswerResponse> {
    const response: IRequestResumeAnswerResponse = {
      ok: false,
      error: '',
    };

    try {
      // verify expert
      const expertFindOneResult = await ExpertModel.findOne({
        attributes: ['specialty'],
        where: { userId },
      });
      if (!expertFindOneResult) {
        response.error = '전문가 검색 오류입니다.';
        return response;
      }
      // find or create receiver
      const receiverFindOrCreateResult = await ReceiverModel.findOrCreate({
        where: {
          userId,
          requestId,
        },
        defaults: {
          userId,
          requestId,
        },
      });
      if (!receiverFindOrCreateResult) {
        response.error = '답변 생성 오류입니다.';
        return response;
      } else if (!receiverFindOrCreateResult[1]) {
        response.error = '이미 답변하신 의뢰입니다.';
        return response;
      }
      // create receiver answer
      const receiverAnswerCreateResult = await ReceiverAnswerModel.create({
        receiverId: receiverFindOrCreateResult[0].id,
        workExperience,
        workExperienceDescription,
        roleFit,
        roleFitDescription,
        collaborationAbility,
        collaborationAbilityDescription,
        hardWorking,
        hardWorkingDescription,
        recommendedSalary,
      });
      if (!receiverAnswerCreateResult) {
        response.error = '답변 생성 오류입니다.';
        return response;
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 답변에 실패했습니다.';
    }

    return response;
  }
}

export default RequestService;
