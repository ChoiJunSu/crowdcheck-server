import {
  IReferenceListCandidateRequest,
  IReferenceListCandidateResponse,
  IReferenceRemoveRequest,
  IReferenceRemoveResponse,
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
        attributes: ['id', 'writerId', 'createdAt'],
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
      for (const {
        id,
        writerId,
        createdAt,
        Corporate,
      } of referenceFindAllResult) {
        if (!Corporate) continue;
        // find writer name
        const userFindOneResult = await UserModel.findOne({
          attributes: ['name'],
          where: { id: writerId },
        });
        if (!userFindOneResult) continue;
        response.references.push({
          id,
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

  static async remove({
    userId,
    referenceId,
  }: IReferenceRemoveRequest): Promise<IReferenceRemoveResponse> {
    const response: IReferenceRemoveResponse = {
      ok: false,
      error: '',
    };

    try {
      // verify user and reference
      const referenceFindOneResult = await ReferenceModel.findOne({
        attributes: ['id'],
        where: { id: referenceId, ownerId: userId },
      });
      if (!referenceFindOneResult) {
        response.error = '평판 검색 오류입니다.';
        return response;
      }
      // remove reference
      const referenceDestroyResult = await ReferenceModel.destroy({
        where: { id: referenceId },
      });
      if (!referenceDestroyResult) {
        response.error = '평판 삭제 오류입니다.';
        return response;
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '평판 삭제에 실패했습니다.';
    }

    return response;
  }
}

export default ReferenceService;
