import UserModel from '@models/UserModel';
import {
  IUserGetPersonalRequest,
  IUserGetPersonalResponse,
} from '@services/UserService/type';
import CareerModel from '@models/CareerModel';
import CorporateModel from '@models/CorporateModel';

class UserService {
  static getPersonal = async ({
    userId,
  }: IUserGetPersonalRequest): Promise<IUserGetPersonalResponse> => {
    const response: IUserGetPersonalResponse = {
      ok: false,
      error: '',
      user: null,
      careers: [],
    };

    try {
      // find user
      const userFindOneResult = await UserModel.findOne({
        attributes: ['email', 'name', 'phone'],
        where: { id: userId },
      });
      if (!userFindOneResult) {
        response.error = '사용자 검색 오류입니다.';
        return response;
      }
      // find careers
      const careerFindAllResult = await CareerModel.findAll({
        attributes: ['corporateId', 'department', 'startAt', 'endAt'],
        where: { userId },
        include: {
          model: CorporateModel,
          attributes: ['name'],
        },
      });
      if (!careerFindAllResult) {
        response.error = '경력 검색 오류입니다.';
        return response;
      }
      // generate response
      response.user = {
        email: userFindOneResult.email,
        name: userFindOneResult.name,
        phone: userFindOneResult.phone,
      };
      for (const {
        corporateId,
        department,
        startAt,
        endAt,
        Corporate,
      } of careerFindAllResult) {
        if (!Corporate) continue;
        response.careers.push({
          corporateId,
          corporateName: Corporate.name,
          department,
          startAt,
          endAt,
        });
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '사용자 정보 불러오기에 실패했습니다.';
    }

    return response;
  };
}

export default UserService;
