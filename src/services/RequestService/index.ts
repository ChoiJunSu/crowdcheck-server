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
  IRequestReferenceAnswerRequest,
  IRequestReferenceAnswerResponse,
  IRequestReferenceListCorporateRequest,
  IRequestReferenceListCorporateResponse,
  IRequestReferenceDetailCorporateRequest,
  IRequestReferenceDetailCorporateResponse,
  IRequestRejectRequest,
  IRequestRejectResponse,
  IRequestReferenceUpdateReceiverRequest,
  IRequestReferenceUpdateReceiverResponse,
  IRequestReferenceGetAgreeCorporateRequest,
  IRequestReferenceGetAgreeCorporateResponse,
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
  IRequestResumeDetailCorporateRequest,
  IRequestResumeDetailCorporateResponse,
  IRequestResumeCloseRequest,
  IRequestResumeCloseResponse,
  IRequestResumeRewardRequest,
  IRequestResumeRewardResponse,
  IRequestReferenceCloseRequest,
  IRequestReferenceCloseResponse,
  IRequestReferenceRewardRequest,
  IRequestReferenceRewardResponse,
  IRequestReferenceDetailReceiverRequest,
  IRequestReferenceDetailReceiverResponse,
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
import careerModel from '@models/CareerModel';
import { SensSingleton } from '@utils/sens';
import ExpertModel from '@models/ExpertModel';
import { S3Singleton } from '@utils/s3';
import ReceiverRewardModel from '@models/ReceiverRewardModel';

class RequestService {
  static async referenceRegister({
    userId,
    name,
    phone,
    careers,
    question,
    deadline,
    rewardNum,
    rewardAmount,
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
        rewardNum,
        rewardAmount,
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

  static async referenceDetailReceiver({
    requestId,
    userId,
  }: IRequestReferenceDetailReceiverRequest): Promise<IRequestReferenceDetailReceiverResponse> {
    const response: IRequestReferenceDetailReceiverResponse = {
      ok: false,
      error: '',
      request: null,
      receiverStatus: 'received',
    };

    try {
      // verify userId with receiver
      const receiverFindOneResult = await ReceiverModel.findOne({
        attributes: ['id', 'status'],
        where: { requestId, userId },
      });
      if (!receiverFindOneResult) {
        response.error = '사용자 검색 오류입니다.';
        return response;
      }
      // find request, corporate, candidate
      const requestFindOneResult = await RequestModel.findOne({
        attributes: [
          'question',
          'deadline',
          'rewardNum',
          'rewardAmount',
          'status',
          'createdAt',
        ],
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
      const {
        question,
        deadline,
        rewardNum,
        rewardAmount,
        status,
        createdAt,
        Corporate,
        Candidate,
      } = requestFindOneResult;
      // count receiver
      const receiverCountResult = await ReceiverModel.count({
        attributes: ['id'],
        where: { requestId },
      });
      if (!receiverCountResult) {
        response.error = '평가자 검색 오류입니다.';
        return response;
      }
      // generate response
      response.request = {
        id: requestId,
        question,
        deadline:
          deadline && deadline.getTime() === new Date(MAX_TIMESTAMP).getTime()
            ? null
            : deadline,
        rewardNum,
        rewardAmount,
        status,
        createdAt,
        corporateName: Corporate.name!,
        candidateName: Candidate.name!,
        receiverCount: receiverCountResult ?? 0,
      };
      response.receiverStatus = receiverFindOneResult.status;
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 정보를 불러오는데 실패했습니다.';
    }

    return response;
  }

  static async referenceDetailCorporate({
    requestId,
    userId,
  }: IRequestReferenceDetailCorporateRequest): Promise<IRequestReferenceDetailCorporateResponse> {
    const response: IRequestReferenceDetailCorporateResponse = {
      ok: false,
      error: '',
      request: null,
      answers: [],
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
        attributes: [
          'id',
          'question',
          'deadline',
          'rewardNum',
          'rewardAmount',
          'status',
          'createdAt',
        ],
        where: {
          id: requestId,
          corporateId: userFindOneResult.corporateId,
          type: 'reference',
        },
        include: {
          model: CandidateModel,
          attributes: ['name'],
        },
      });
      if (!requestFindOneResult || !requestFindOneResult.Candidate) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      }
      const {
        id,
        question,
        deadline,
        rewardNum,
        rewardAmount,
        status,
        createdAt,
        Candidate,
      } = requestFindOneResult;
      // find receiver
      const receiverFindAllResult = await ReceiverModel.findAll({
        attributes: ['id', 'corporateId', 'status', 'answer', 'answeredAt'],
        where: { requestId },
      });
      if (!receiverFindAllResult) {
        response.error = '평가자 검색 오류입니다.';
        return response;
      }
      let receiverCount = 0;
      for (const {
        id,
        corporateId,
        status,
        answer,
        answeredAt,
      } of receiverFindAllResult) {
        const corporateFindOneResult = await CorporateModel.findOne({
          attributes: ['name'],
          where: { id: corporateId },
        });
        if (!corporateFindOneResult) continue;
        if (status === 'answered') receiverCount++;
        response.answers.push({
          receiverId: id,
          corporateName: corporateFindOneResult.name,
          status,
          answer,
          answeredAt,
        });
      }
      response.request = {
        id,
        candidateName: Candidate.name!,
        question,
        deadline:
          deadline && deadline.getTime() === new Date(MAX_TIMESTAMP).getTime()
            ? null
            : deadline,
        rewardNum,
        rewardAmount,
        receiverCount,
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

  static async referenceGetAgreeCorporate({
    requestId,
    userId,
  }: IRequestReferenceGetAgreeCorporateRequest): Promise<IRequestReferenceGetAgreeCorporateResponse> {
    const response: IRequestReferenceGetAgreeCorporateResponse = {
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
      response.candidateName = Candidate.name!;
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
          attributes: [
            'deadline',
            'rewardNum',
            'rewardAmount',
            'status',
            'createdAt',
          ],
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
        const {
          deadline,
          rewardNum,
          rewardAmount,
          status,
          createdAt,
          Corporate,
          Candidate,
        } = requestFindOneResult;
        // count receiver
        const receiverCountResult = await ReceiverModel.count({
          where: { requestId, status: 'answered' },
        });
        // find receiver status
        const receiverFindOneResult = await ReceiverModel.findOne({
          attributes: ['status'],
          where: { requestId, userId },
        });
        if (!receiverFindOneResult) {
          response.error = '수신자 검색 오류입니다.';
          return response;
        }
        // generate response
        response.requests.push({
          id: requestId,
          deadline:
            deadline && deadline.getTime() === new Date(MAX_TIMESTAMP).getTime()
              ? null
              : deadline,
          rewardNum,
          rewardAmount,
          status,
          createdAt,
          corporateName: Corporate.name!,
          candidateName: Candidate.name!,
          receiverCount: receiverCountResult ?? 0,
          receiverStatus: receiverFindOneResult.status,
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
      // find request
      const requestFindAllResult = await RequestModel.findAll({
        attributes: [
          'id',
          'deadline',
          'rewardNum',
          'rewardAmount',
          'status',
          'createdAt',
        ],
        where: {
          corporateId: userFindOneResult.corporateId,
          type: 'reference',
        },
        order: [['createdAt', 'DESC']],
        include: {
          model: CandidateModel,
          attributes: ['name'],
        },
      });
      if (!requestFindAllResult) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      }
      // find receiver and push request
      for (const {
        id,
        deadline,
        rewardNum,
        rewardAmount,
        status,
        createdAt,
        Candidate,
      } of requestFindAllResult) {
        if (!Candidate) continue;
        // count receiver
        const receiverCountResult = await ReceiverModel.count({
          where: { requestId: id },
        });
        // generate response
        response.requests.push({
          id,
          candidateName: Candidate.name!,
          deadline:
            deadline && deadline.getTime() === new Date(MAX_TIMESTAMP).getTime()
              ? null
              : deadline,
          rewardNum,
          rewardAmount,
          receiverCount: receiverCountResult ?? 0,
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
        attributes: ['id', 'status', 'createdAt'],
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
      for (const { id, status, createdAt, Corporate } of requestFindAllResult) {
        if (!Corporate) continue;
        response.requests.push({
          id,
          corporateName: Corporate.name,
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
        requestFindOneResult.Receivers[0].status !== 'received'
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
      const corporateFindOneResult = await CorporateModel.findOne({
        attributes: ['id'],
        where: { id: requestFindOneResult.corporateId },
        include: {
          model: UserModel,
          attributes: ['phone'],
        },
      });
      if (!corporateFindOneResult || !corporateFindOneResult.User) {
        response.error = '기업 검색 오류입니다.';
        return response;
      }
      // send alarm
      const sendMessageResponse = await SensSingleton.sendMessage({
        templateCode: 'answer2',
        messages: [
          {
            to: corporateFindOneResult.User.phone,
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
        (requestFindOneResult.Receivers[0].status !== 'received' &&
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

  static async referenceClose({
    userId,
    requestId,
  }: IRequestReferenceCloseRequest): Promise<IRequestReferenceCloseResponse> {
    const response: IRequestReferenceCloseResponse = {
      ok: false,
      error: '',
    };

    try {
      // verify userId with requestId
      const userFindOneResult = await UserModel.findOne({
        attributes: ['id'],
        where: { id: userId },
        include: {
          model: CorporateModel,
          attributes: ['id'],
        },
      });
      if (!userFindOneResult || !userFindOneResult.Corporate) {
        response.error = '사용자 검색에 실패했습니다.';
        return response;
      }
      const requestFindOneResult = await RequestModel.findOne({
        attributes: ['status'],
        where: {
          id: requestId,
          corporateId: userFindOneResult.Corporate.id,
          type: 'reference',
        },
      });
      if (!requestFindOneResult) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      } else if (
        requestFindOneResult.status !== 'registered' &&
        requestFindOneResult.status !== 'agreed'
      ) {
        response.error = '이미 마감된 의뢰입니다.';
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

  static async referenceReward({
    userId,
    requestId,
    receivers,
  }: IRequestReferenceRewardRequest): Promise<IRequestReferenceRewardResponse> {
    const response: IRequestReferenceRewardResponse = {
      ok: false,
      error: '',
    };

    try {
      // verify userId with requestId
      const userFindOneResult = await UserModel.findOne({
        attributes: ['id'],
        where: { id: userId },
        include: {
          model: CorporateModel,
          attributes: ['id'],
        },
      });
      if (!userFindOneResult || !userFindOneResult.Corporate) {
        response.error = '사용자 검색에 실패했습니다.';
        return response;
      }
      const requestFindOneResult = await RequestModel.findOne({
        attributes: ['status', 'rewardNum', 'rewardAmount'],
        where: {
          id: requestId,
          corporateId: userFindOneResult.Corporate.id,
          type: 'reference',
        },
        include: {
          model: ReceiverModel,
          attributes: ['id', 'userId'],
        },
      });
      if (!requestFindOneResult || !requestFindOneResult.Receivers) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      } else if (requestFindOneResult.status !== 'closed') {
        response.error = '먼저 의뢰를 마감해주세요.';
        return response;
      } else if (requestFindOneResult.rewardNum < receivers.length) {
        response.error = '선정하신 답변 수가 너무 많습니다.';
        return response;
      }
      // generate request receivers
      const requestReceivers: Array<number> = [];
      for (const { id } of requestFindOneResult.Receivers) {
        requestReceivers.push(id);
      }
      // create receiver reward
      for (const { id } of receivers) {
        if (!requestReceivers.includes(id)) {
          response.error = '답변자 검색 오류입니다.';
          return response;
        }
        const receiverRewardCreateResult = await ReceiverRewardModel.create({
          receiverId: id,
          amount: requestFindOneResult.rewardAmount,
        });
        if (!receiverRewardCreateResult) {
          response.error = '답변자 보상 생성 오류입니다.';
          return response;
        }
        for (const receiver of requestFindOneResult.Receivers) {
          if (receiver.id === id) {
            // find user phone
            const userFindOneResult = await UserModel.findOne({
              attributes: ['phone'],
              where: { id: receiver.userId },
            });
            if (userFindOneResult && userFindOneResult.phone) {
              // send message
            }
            break;
          }
        }
      }
      // update request
      const requestUpdateResult = await RequestModel.update(
        {
          status: 'rewarded',
          rewardedAt: new Date(),
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
      response.error = '답변 선정에 실패했습니다.';
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
    rewardAmount,
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
        rewardAmount,
        type: 'resume',
      });
      if (!createRequestResult || !createRequestResult.id) {
        response.error = '의뢰 생성 오류입니다.';
        return response;
      }
      // create candidate
      const candidateCreateResult = await CandidateModel.create({
        requestId: createRequestResult.id,
        resumeBucket: resume.bucket,
        resumeKey: resume.key,
        portfolioBucket: portfolio?.bucket ?? null,
        portfolioKey: portfolio?.key ?? null,
      });
      if (!candidateCreateResult) {
        response.error = '지원자 생성 오류입니다.';
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
        attributes: [
          'id',
          'memo',
          'deadline',
          'rewardNum',
          'rewardAmount',
          'status',
          'createdAt',
        ],
        where: { corporateId: userFindOneResult.corporateId, type: 'resume' },
        order: [['createdAt', 'DESC']],
      });
      if (!requestFindAllResult) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      }
      // find receiver and push request
      for (const {
        id,
        memo,
        deadline,
        rewardNum,
        rewardAmount,
        status,
        createdAt,
      } of requestFindAllResult) {
        // count receiver
        const receiverCountResult = await ReceiverModel.count({
          where: { requestId: id },
        });
        // generate response
        response.requests.push({
          id,
          memo,
          deadline:
            deadline && deadline.getTime() === new Date(MAX_TIMESTAMP).getTime()
              ? null
              : deadline,
          rewardNum,
          rewardAmount,
          receiverCount: receiverCountResult ?? 0,
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
          attributes: [
            'id',
            'deadline',
            'rewardNum',
            'rewardAmount',
            'status',
            'createdAt',
          ],
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
        const {
          deadline,
          rewardNum,
          rewardAmount,
          status,
          createdAt,
          Corporate,
        } = requestFindOneResult;
        response.requests.push({
          id: requestFindOneResult.id,
          corporateName: Corporate.name,
          deadline:
            deadline && deadline.getTime() === new Date(MAX_TIMESTAMP).getTime()
              ? null
              : deadline,
          rewardNum,
          rewardAmount,
          receiverCount: receiverCountResult ?? 0,
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
        attributes: [
          'id',
          'deadline',
          'rewardNum',
          'rewardAmount',
          'status',
          'createdAt',
        ],
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
        rewardAmount,
        status,
        createdAt,
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
          rewardAmount,
          receiverCount: receiverCountResult ?? 0,
          status,
          createdAt,
        });
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 탐색에 실패했습니다.';
    }

    return response;
  }

  static async resumeDetailCorporate({
    userId,
    requestId,
  }: IRequestResumeDetailCorporateRequest): Promise<IRequestResumeDetailCorporateResponse> {
    const response: IRequestResumeDetailCorporateResponse = {
      ok: false,
      error: '',
      request: null,
      answers: [],
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
        attributes: [
          'id',
          'memo',
          'question',
          'deadline',
          'rewardNum',
          'rewardAmount',
          'status',
          'createdAt',
        ],
        where: {
          id: requestId,
          corporateId: userFindOneResult.corporateId,
          type: 'resume',
        },
      });
      if (!requestFindOneResult) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      }
      const {
        id,
        memo,
        question,
        deadline,
        rewardNum,
        rewardAmount,
        status,
        createdAt,
      } = requestFindOneResult;
      // find and count receivers
      const receiverFindAndCountAllResult = await ReceiverModel.findAndCountAll(
        {
          attributes: [
            'id',
            'workExperience',
            'workExperienceDescription',
            'roleFit',
            'roleFitDescription',
            'collaborationAbility',
            'collaborationAbilityDescription',
            'hardWorking',
            'hardWorkingDescription',
            'recommendedSalary',
            'answeredAt',
          ],
          where: { requestId },
          include: [
            {
              model: UserModel,
              attributes: ['name'],
            },
          ],
        }
      );
      if (!receiverFindAndCountAllResult) {
        response.error = '답변 검색 오류입니다.';
        return response;
      }
      for (const {
        id,
        workExperience,
        workExperienceDescription,
        roleFit,
        roleFitDescription,
        collaborationAbility,
        collaborationAbilityDescription,
        hardWorking,
        hardWorkingDescription,
        recommendedSalary,
        answeredAt,
        User,
      } of receiverFindAndCountAllResult.rows) {
        if (!User) continue;
        response.answers.push({
          receiverId: id,
          receiverName: User.name,
          answeredAt,
          workExperience: workExperience!,
          workExperienceDescription: workExperienceDescription!,
          roleFit: roleFit!,
          roleFitDescription: roleFitDescription!,
          collaborationAbility: collaborationAbility!,
          collaborationAbilityDescription: collaborationAbilityDescription!,
          hardWorking: hardWorking!,
          hardWorkingDescription: hardWorkingDescription!,
          recommendedSalary: recommendedSalary!,
        });
      }
      response.request = {
        id,
        memo: memo!,
        question,
        deadline:
          deadline && deadline.getTime() === new Date(MAX_TIMESTAMP).getTime()
            ? null
            : deadline,
        rewardNum,
        rewardAmount,
        receiverCount: receiverFindAndCountAllResult.count,
        status,
        createdAt,
      };
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 조회에 실패했습니다.';
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
      answered: false,
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
          'rewardAmount',
          'status',
          'createdAt',
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
        rewardAmount,
        status,
        createdAt,
        Corporate,
      } = requestFindOneResult;
      // find and count receiver
      const receiverFindAndCountAllResult = await ReceiverModel.findAndCountAll(
        {
          attributes: ['id'],
          where: { requestId },
          include: {
            model: UserModel,
            attributes: ['id'],
          },
        }
      );
      if (!receiverFindAndCountAllResult) {
        response.error = '답변자 검색 오류입니다.';
        return response;
      }
      for (const { User } of receiverFindAndCountAllResult.rows) {
        if (!User) continue;
        if (userId === User.id) response.answered = true;
      }
      // generate response
      response.request = {
        id,
        corporateName: Corporate.name,
        question,
        deadline:
          deadline && deadline.getTime() === new Date(MAX_TIMESTAMP).getTime()
            ? null
            : deadline,
        rewardNum,
        rewardAmount,
        receiverCount: receiverFindAndCountAllResult.count ?? 0,
        status,
        createdAt,
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
            model: CandidateModel,
            attributes: [
              'resumeBucket',
              'resumeKey',
              'portfolioBucket',
              'portfolioKey',
            ],
          },
        ],
      });
      if (
        !requestFindOneResult ||
        !requestFindOneResult.Corporate ||
        !requestFindOneResult.Candidate
      ) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      } else if (requestFindOneResult.status !== 'registered') {
        response.error = '이미 마감된 의뢰입니다.';
        return response;
      }
      // generate response
      const { id, question, Corporate, Candidate } = requestFindOneResult;
      response.request = {
        id,
        corporateName: Corporate.name,
        question,
        resumeUrl: S3Singleton.getSignedUrl(
          Candidate.resumeBucket!,
          Candidate.resumeKey!
        ),
        portfolioUrl: Candidate.portfolioBucket
          ? S3Singleton.getSignedUrl(
              Candidate.portfolioBucket,
              Candidate.portfolioKey!
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
          workExperience,
          workExperienceDescription,
          roleFit,
          roleFitDescription,
          collaborationAbility,
          collaborationAbilityDescription,
          hardWorking,
          hardWorkingDescription,
          recommendedSalary,
          answeredAt: new Date(),
        },
      });
      if (!receiverFindOrCreateResult) {
        response.error = '답변 생성 오류입니다.';
        return response;
      } else if (!receiverFindOrCreateResult[1]) {
        response.error = '이미 답변하신 의뢰입니다.';
        return response;
      }
      // find request corporate id
      const requestFindOneResult = await RequestModel.findOne({
        attributes: ['corporateId'],
        where: { id: requestId },
      });
      if (requestFindOneResult && requestFindOneResult.corporateId) {
        // find user phone
        const userFindOneResult = await UserModel.findOne({
          attributes: ['phone'],
          where: { corporateId: requestFindOneResult.corporateId },
        });
        if (userFindOneResult && userFindOneResult.phone) {
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
        }
      }

      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 답변에 실패했습니다.';
    }

    return response;
  }

  static async resumeClose({
    userId,
    requestId,
  }: IRequestResumeCloseRequest): Promise<IRequestResumeCloseResponse> {
    const response: IRequestResumeCloseResponse = {
      ok: false,
      error: '',
    };

    try {
      // verify userId with requestId
      const userFindOneResult = await UserModel.findOne({
        attributes: ['id'],
        where: { id: userId },
        include: {
          model: CorporateModel,
          attributes: ['id'],
        },
      });
      if (!userFindOneResult || !userFindOneResult.Corporate) {
        response.error = '사용자 검색에 실패했습니다.';
        return response;
      }
      const requestFindOneResult = await RequestModel.findOne({
        attributes: ['status'],
        where: {
          id: requestId,
          corporateId: userFindOneResult.Corporate.id,
          type: 'resume',
        },
      });
      if (!requestFindOneResult) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      } else if (requestFindOneResult.status !== 'registered') {
        response.error = '이미 마감된 의뢰입니다.';
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

  static async resumeReward({
    userId,
    requestId,
    receivers,
  }: IRequestResumeRewardRequest): Promise<IRequestResumeRewardResponse> {
    const response: IRequestResumeRewardResponse = {
      ok: false,
      error: '',
    };

    try {
      // verify userId with requestId
      const userFindOneResult = await UserModel.findOne({
        attributes: ['id'],
        where: { id: userId },
        include: {
          model: CorporateModel,
          attributes: ['id'],
        },
      });
      if (!userFindOneResult || !userFindOneResult.Corporate) {
        response.error = '사용자 검색에 실패했습니다.';
        return response;
      }
      const requestFindOneResult = await RequestModel.findOne({
        attributes: ['status', 'rewardNum', 'rewardAmount'],
        where: {
          id: requestId,
          corporateId: userFindOneResult.Corporate.id,
          type: 'resume',
        },
        include: {
          model: ReceiverModel,
          attributes: ['id', 'userId'],
        },
      });
      if (!requestFindOneResult || !requestFindOneResult.Receivers) {
        response.error = '의뢰 검색 오류입니다.';
        return response;
      } else if (requestFindOneResult.status !== 'closed') {
        response.error = '먼저 의뢰를 마감해주세요.';
        return response;
      } else if (requestFindOneResult.rewardNum < receivers.length) {
        response.error = '선정하신 답변 수가 너무 많습니다.';
        return response;
      }
      // generate request receivers
      const requestReceivers: Array<number> = [];
      for (const { id } of requestFindOneResult.Receivers) {
        requestReceivers.push(id);
      }
      // create receiver reward
      for (const { id } of receivers) {
        if (!requestReceivers.includes(id)) {
          response.error = '답변자 검색 오류입니다.';
          return response;
        }
        const receiverRewardCreateResult = await ReceiverRewardModel.create({
          receiverId: id,
          amount: requestFindOneResult.rewardAmount,
        });
        if (!receiverRewardCreateResult) {
          response.error = '답변자 보상 생성 오류입니다.';
          return response;
        }
        for (const receiver of requestFindOneResult.Receivers) {
          if (receiver.id === id) {
            // find user phone
            const userFindOneResult = await UserModel.findOne({
              attributes: ['phone'],
              where: { id: receiver.userId },
            });
            if (userFindOneResult && userFindOneResult.phone) {
              // send message
            }
            break;
          }
        }
      }
      // update request
      const requestUpdateResult = await RequestModel.update(
        {
          status: 'rewarded',
          rewardedAt: new Date(),
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
      response.error = '답변 선정에 실패했습니다.';
    }

    return response;
  }
}

export default RequestService;
