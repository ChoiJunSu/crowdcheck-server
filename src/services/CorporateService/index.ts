import CorporateModel from '@models/CorporateModel';
import {
  IAddRequest,
  IAddResponse,
  ISearchRequest,
  ISearchResponse,
} from '@services/CorporateService/type';
import { Op } from 'sequelize';

class CorporateService {
  static search = async ({
    word,
  }: ISearchRequest): Promise<ISearchResponse> => {
    const response: ISearchResponse = {
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

  static add = async ({ name }: IAddRequest): Promise<IAddResponse> => {
    const response: IAddResponse = {
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
