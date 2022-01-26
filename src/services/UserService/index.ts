import UserModel from '@models/UserModel';
import {
  IUserCareerVerifyRequest,
  IUserCareerVerifyResponse,
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
import CareerVerifyModel from '@models/CareerVerifyModel';
import careerModel from '@models/CareerModel';
import RequestService from '@services/RequestService';

class UserService {
  static async getPersonal({
    userId,
  }: IUserGetPersonalRequest): Promise<IUserGetPersonalResponse> {
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
        attributes: [
          'id',
          'corporateId',
          'department',
          'startAt',
          'endAt',
          'status',
        ],
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
        id,
        corporateId,
        department,
        startAt,
        endAt,
        status,
        Corporate,
      } of careerFindAllResult) {
        if (!Corporate) continue;
        response.careers.push({
          id,
          corporateId,
          corporateName: Corporate.name,
          department,
          startAt,
          endAt: endAt > new Date() ? null : endAt,
          status,
        });
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '사용자 정보 불러오기에 실패했습니다.';
    }

    return response;
  }

  static async getCorporate({
    userId,
  }: IUserGetCorporateRequest): Promise<IUserGetCorporateResponse> {
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
  }

  static async editPersonal({
    userId,
    password,
    careers,
  }: IUserEditPersonalRequest): Promise<IUserEditPersonalResponse> {
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
      // update receiver
      const updateReceiverResponse = await RequestService.updateReceiver({
        userId,
      });
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '사용자 정보 수정에 실패했습니다.';
    }

    return response;
  }

  static async editCorporate({
    userId,
    password,
  }: IUserEditCorporateRequest): Promise<IUserEditCorporateResponse> {
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
  }

  static async careerVerify({
    userId,
    careerId,
    certificate,
  }: IUserCareerVerifyRequest): Promise<IUserCareerVerifyResponse> {
    const response: IUserCareerVerifyResponse = {
      ok: false,
      error: '',
    };

    try {
      // verify userId with careerId
      const careerFindOneResult = await CareerModel.findOne({
        attributes: ['userId', 'status'],
        where: { id: careerId },
      });
      if (!careerFindOneResult) {
        response.error = '경력 검색 오류입니다.';
        return response;
      } else if (careerFindOneResult.status !== 'registered') {
        response.error = '잘못된 접근입니다.';
        return response;
      } else if (careerFindOneResult.userId !== userId) {
        response.error = '경력 정보가 일치하지 않습니다.';
        return response;
      }
      // create careerVerify
      const careerVerifyCreateResult = await CareerVerifyModel.create({
        careerId,
        certificateBucket: certificate.bucket,
        certificateKey: certificate.key,
      });
      if (!careerVerifyCreateResult) {
        response.error = '경력 인증 생성 오류입니다.';
        return response;
      }
      // update career status
      const careerUpdateResult = await careerModel.update(
        {
          status: 'reviewed',
          reviewedAt: new Date(),
        },
        { where: { id: careerId } }
      );
      if (!careerUpdateResult) {
        response.error = '경력 정보 업데이트 오류입니다.';
        return response;
      }
      response.ok = true;
    } catch (e) {
      console.error(e);
      response.error = '경력 인증에 실패했습니다.';
    }

    return response;
  }
}

export default UserService;
