import CorporateModel from '@models/CorporateModel';
import {
  ICorporateAddRequest,
  ICorporateAddResponse,
  ICorporateSearchRequest,
  ICorporateSearchResponse,
} from '@services/CorporateService/type';
import { Op } from 'sequelize';

class CorporateService {
  static search = async ({
    word,
  }: ICorporateSearchRequest): Promise<ICorporateSearchResponse> => {
    const response: ICorporateSearchResponse = {
      ok: false,
      error: '',
      corporates: [],
    };
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
      console.log('search for ', word, ': ', corporateFindAllResult);
    } catch (e) {
      console.error(e);
      response.error = '기업 검색에 실패했습니다.';
    }

    return response;
  };

  static add = async ({
    name,
  }: ICorporateAddRequest): Promise<ICorporateAddResponse> => {
    const response: ICorporateAddResponse = {
      ok: false,
      error: '',
    };
    try {
      const corporateCreateResult = CorporateModel.create({ name });
      if (!corporateCreateResult) {
        response.error = '기업 추가 오류입니다.';
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '기업 추가에 실패했습니다.';
    }

    return response;
  };
}

export default CorporateService;
