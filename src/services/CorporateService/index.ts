import CorporateModel from '@models/CorporateModel';
import {
  ICorporateSearchRequest,
  ICorporateSearchResponse,
} from '@services/CorporateService/type';
import { Op } from 'sequelize';

class CorporateService {
  static async search({
    word,
  }: ICorporateSearchRequest): Promise<ICorporateSearchResponse> {
    const response: ICorporateSearchResponse = {
      ok: false,
      error: '',
      corporates: [],
    };

    if (word.length < 2) {
      response.error = '두 글자 이상 입력해주세요.';
      return response;
    }

    try {
      const corporateFindAllResult = await CorporateModel.findAll({
        attributes: ['id', 'name'],
        where: { name: { [Op.substring]: word } },
        limit: 10,
      });
      if (!corporateFindAllResult) {
        response.error = '기업 검색 오류입니다.';
        return response;
      }
      corporateFindAllResult.forEach(({ id, name }) => {
        response.corporates.push({ id, name });
      });
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '기업 검색에 실패했습니다.';
    }

    return response;
  }
}

export default CorporateService;
