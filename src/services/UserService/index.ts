import UserModel from '@models/UserModel';
import {
  ICreateUserRequest,
  ICreateUserResponse,
  IGetUserByEmailRequest,
  IGetUserByEmailResponse,
} from '@services/UserService/type';

class UserService {
  static getUserByEmail = async ({
    email,
  }: IGetUserByEmailRequest): Promise<IGetUserByEmailResponse> => {
    const response: IGetUserByEmailResponse = {
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
  }: ICreateUserRequest): Promise<ICreateUserResponse> => {
    const response: ICreateUserResponse = {
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
