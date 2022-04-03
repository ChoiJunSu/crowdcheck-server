import {
  IReferenceListCandidateRequest,
  IReferenceListCandidateResponse,
} from '@services/ReferenceService/type';
import ReferenceModel from '@models/ReferenceModel';
import CorporateModel from '@models/CorporateModel';
import UserModel from '@models/UserModel';

class ReferenceService {
  static async listCandidate({
    userId,
  }: IReferenceListCandidateRequest): Promise<IReferenceListCandidateResponse> {
    const response: IReferenceListCandidateResponse = {
      ok: false,
      error: '',
      references: [],
    };

    try {
      // find references
      const referenceFindAllResult = await ReferenceModel.findAll({
        attributes: ['writerId', 'createdAt'],
        where: { ownerId: userId, type: 'nomination' },
        include: {
          model: CorporateModel,
          attributes: ['name'],
        },
      });
      if (!referenceFindAllResult) {
        response.error = '평판 검색 오류입니다.';
        return response;
      }
      // generate response
      for (const { writerId, createdAt, Corporate } of referenceFindAllResult) {
        if (!Corporate) continue;
        // find writer name
        const userFindOneResult = await UserModel.findOne({
          attributes: ['name'],
          where: { id: writerId },
        });
        if (!userFindOneResult) continue;
        response.references.push({
          writerName: userFindOneResult.name,
          corporateName: Corporate.name,
          createdAt,
        });
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '평판 목록 조회에 실패했습니다.';
    }

    return response;
  }
}

export default ReferenceService;
