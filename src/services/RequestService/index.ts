import {
  IRequestRegisterRequest,
  IRequestRegisterResponse,
} from '@services/RequestService/type';
import RequestModel from '@models/RequestModel';
import CorporateModel from '@models/CorporateModel';
import CandidateModel from '@models/CandidateModel';
import CandidateAgreeModel from '@models/CandidateAgreeModel';

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
      for (const { name, department, startAt, endAt } of career) {
        const corporateFindResult = await CorporateModel.findOne({
          where: { name },
        });
        if (!corporateFindResult) {
          response.error = '경력 오류입니다.';
          return response;
        }
        const candidateAgreeCreateResult = await CandidateAgreeModel.create({
          requestId: createRequestResult.id,
          corporateId: corporateFindResult.id,
          candidateId: createCandidateResult.id,
          department,
          startAt,
          endAt,
        });
        if (!candidateAgreeCreateResult) {
          response.error = '지원자 동의 생성 오류입니다.';
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
  };
}

export default RequestService;
