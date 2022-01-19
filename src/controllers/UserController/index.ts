import { AsyncRouter } from 'express-async-router';
import {
  INextFunction,
  IRequest,
  IResponse,
} from '@controllers/BaseController/type';
import UserService from '@services/UserService';
import { IUserGetPersonalRequest } from '@services/UserService/type';

const UserController = AsyncRouter();

UserController.get(
  '/get/personal',
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    return res.send(
      await UserService.getPersonal({
        userId: req.user!.id,
      } as IUserGetPersonalRequest)
    );
  }
);

export default UserController;
