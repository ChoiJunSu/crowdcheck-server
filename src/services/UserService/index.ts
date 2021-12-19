import UserModel from '@models/UserModel';
import {
  createUserRequestDto,
  createUserResponseDto,
  getUserByEmailRequestDto,
  getUserByEmailResponseDto,
} from '@services/UserService/type';

class UserService {
  static getUserByEmail = async ({
    email,
  }: getUserByEmailRequestDto): Promise<getUserByEmailResponseDto> => {
    const response: getUserByEmailResponseDto = {
      ok: false,
      error: '',
      user: null,
    };
    try {
      const userFindOneResult = await UserModel.findOne({
        where: {
          email,
        },
      });
      if (!userFindOneResult) {
        response.error = 'User not found';
        return response;
      } else {
        response.ok = true;
        response.user = userFindOneResult;
      }
    } catch (error) {
      console.error(error);
      response.error = 'Internal error';
    }

    return response;
  };

  static createUser = async ({
    email,
  }: createUserRequestDto): Promise<createUserResponseDto> => {
    const response: createUserResponseDto = {
      ok: false,
      error: '',
    };
    try {
      const userCreateResult = await UserModel.create({
        email,
      });
      if (!userCreateResult) {
        response.error = 'Failed to create user';
        return response;
      }
      response.ok = true;
    } catch (error) {
      console.error(error);
      response.error = 'Internal error';
    }

    return response;
  };
}

export default UserService;
