import UserModel from '@models/UserModel';
import {
  IUserEditCorporateRequest,
  IUserEditCorporateResponse,
  IUserEditPersonalRequest,
  IUserEditPersonalResponse,
  IUserGetCorporateRequest,
  IUserGetCorporateResponse,
  IUserGetPersonalRequest,
  IUserGetPersonalResponse,
} from '@services/UserService/type';
import CareerModel from '@models/CareerModel';
import CorporateModel from '@models/CorporateModel';
import { genSalt, hash } from 'bcrypt';
import { MAX_TIMESTAMP } from '@constants/date';

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
          endAt: endAt > new Date() ? null : endAt,
        });
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '사용자 정보 불러오기에 실패했습니다.';
    }

    return response;
  };

  static getCorporate = async ({
    userId,
  }: IUserGetCorporateRequest): Promise<IUserGetCorporateResponse> => {
    const response: IUserGetCorporateResponse = {
      ok: false,
      error: '',
      user: null,
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
      // generate response
      response.user = {
        email: userFindOneResult.email,
        name: userFindOneResult.name,
        phone: userFindOneResult.phone,
      };
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '사용자 정보 불러오기에 실패했습니다.';
    }

    return response;
  };

  static editPersonal = async ({
    userId,
    password,
    careers,
  }: IUserEditPersonalRequest): Promise<IUserEditPersonalResponse> => {
    const response: IUserEditPersonalResponse = {
      ok: false,
      error: '',
    };

    try {
      // find user
      const userFindOneResult = await UserModel.findOne({
        attributes: ['name'],
        where: { id: userId },
        include: {
          model: CareerModel,
          attributes: ['id', 'corporateId', 'department', 'startAt', 'endAt'],
        },
      });
      if (!userFindOneResult || !userFindOneResult.Careers) {
        response.error = '사용자 검색 오류입니다.';
        return response;
      }
      // update user password
      if (password) {
        // hash password
        const salt = await genSalt(10);
        const hashed = await hash(password, salt);
        const userPasswordUpdateResult = await UserModel.update(
          { hashed },
          { where: { id: userId } }
        );
        if (!userPasswordUpdateResult) {
          response.error = '사용자 비밀번호 업데이트 오류입니다.';
          return response;
        }
      }
      // add career
      const corporateIds: Array<number> = [];
      for (const { corporateName, department, startAt, endAt } of careers) {
        const corporateFindOrCreateResult = await CorporateModel.findOrCreate({
          attributes: ['id'],
          where: { name: corporateName },
          defaults: {
            name: corporateName,
          },
        });
        if (!corporateFindOrCreateResult || !corporateFindOrCreateResult[0]) {
          response.error = '기업 검색 및 생성 오류입니다.';
          return response;
        }
        corporateIds.push(corporateFindOrCreateResult[0].id);
        // add career
        const careerFindOrCreateResult = await CareerModel.findOrCreate({
          attributes: ['id'],
          where: { userId, corporateId: corporateFindOrCreateResult[0].id },
          defaults: {
            userId,
            corporateId: corporateFindOrCreateResult[0].id,
            department,
            startAt,
            endAt: endAt || new Date(MAX_TIMESTAMP),
          },
        });
        if (!careerFindOrCreateResult || !careerFindOrCreateResult[0]) {
          response.error = '경력 생성 오류입니다.';
          return response;
        }
      }
      // remove career
      for (const { corporateId } of userFindOneResult.Careers) {
        if (!corporateIds.includes(corporateId)) {
          const careerDestroyResult = await CareerModel.destroy({
            where: { userId, corporateId },
          });
          if (!careerDestroyResult) {
            response.error = '경력 삭제 오류입니다.';
            return response;
          }
        }
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '사용자 정보 수정에 실패했습니다.';
    }

    return response;
  };

  static editCorporate = async ({
    userId,
    password,
  }: IUserEditCorporateRequest): Promise<IUserEditCorporateResponse> => {
    const response: IUserEditCorporateResponse = {
      ok: false,
      error: '',
    };

    try {
      // find user
      const userFindOneResult = await UserModel.findOne({
        attributes: ['id'],
        where: { id: userId },
      });
      if (!userFindOneResult) {
        response.error = '사용자 검색 오류입니다.';
        return response;
      }
      // update user password
      if (password) {
        // hash password
        const salt = await genSalt(10);
        const hashed = await hash(password, salt);
        const userPasswordUpdateResult = await UserModel.update(
          { hashed },
          { where: { id: userId } }
        );
        if (!userPasswordUpdateResult) {
          response.error = '사용자 비밀번호 업데이트 오류입니다.';
          return response;
        }
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '사용자 정보 수정에 실패했습니다.';
    }

    return response;
  };
}

export default UserService;
