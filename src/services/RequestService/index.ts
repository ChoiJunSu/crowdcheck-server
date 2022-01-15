import {
  IRequestRegisterRequest,
  IRequestRegisterResponse,
  IRequestGetCandidateRequest,
  IRequestGetCandidateResponse,
  IRequestListCandidateRequest,
  IRequestListCandidateResponse,
  IRequestAgreeRequest,
  IRequestAgreeResponse,
} from '@services/RequestService/type';
import RequestModel from '@models/RequestModel';
import CorporateModel from '@models/CorporateModel';
import CandidateModel from '@models/CandidateModel';
import CandidateAgreeModel from '@models/CandidateAgreeModel';
import { randomBytes } from 'crypto';
import CareerModel from '@models/CareerModel';
import { Op, Sequelize } from 'sequelize';
import CorporateService from '@services/CorporateService';
import ReceiverModel from '@models/ReceiverModel';
import { MAX_TIMESTAMP } from '@constants/date';

class RequestService {
  static register = async ({
    corporateId,
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
      // create request
      const createRequestResult = await RequestModel.create({
        corporateId,
        question,
        deadline,
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
      for (const {
        corporateId,
        corporateName,
        department,
        startAt,
        endAt,
      } of career) {
        // verify corporateId with corporateName
        const corporateFindResult = await CorporateModel.findOne({
          where: { id: corporateId, name: corporateName },
        });
        if (!corporateFindResult) {
          response.error = '경력 오류입니다.';
          return response;
        }
        // create candidateAgree
        const candidateAgreeCreateResult = await CandidateAgreeModel.create({
          requestId: createRequestResult.id,
          corporateId,
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

  static getCandidate = async ({
    requestId,
    candidateId,
  }: IRequestGetCandidateRequest): Promise<IRequestGetCandidateResponse> => {
    const response: IRequestGetCandidateResponse = {
      ok: false,
      error: '',
      career: [],
    };
    try {
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
          attributes: ['name'],
          where: { id: corporateId },
        });
        if (!corporateFindOneResult) {
          response.error = '기업 검색 오류입니다.';
          return response;
        }
        response.career.push({
          corporateId,
          corporateName: corporateFindOneResult.name,
          department,
          startAt,
          endAt,
        });
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '의뢰 정보를 불러오는데 실패했습니다.';
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
}

export default RequestService;
