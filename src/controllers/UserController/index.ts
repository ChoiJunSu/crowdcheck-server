import { AsyncRouter } from 'express-async-router';
import {
  INextFunction,
  IRequest,
  IResponse,
} from '@controllers/BaseController/type';
import UserService from '@services/UserService';
import {
  IUserEditPersonalRequest,
  IUserGetPersonalRequest,
} from '@services/UserService/type';
import AuthMiddleware from '@middlewares/AuthMiddleware';

const UserController = AsyncRouter();

UserController.get(
  '/get/personal',
  AuthMiddleware.isPersonal,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    return res.send(
      await UserService.getPersonal({
        userId: req.user!.id,
      } as IUserGetPersonalRequest)
    );
  }
);

UserController.post(
  '/edit/personal',
  AuthMiddleware.isPersonal,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { name, password, careers } = req.body;

    return res.send(
      await UserService.editPersonal({
        userId: req.user!.id,
        name,
        password,
        careers,
      } as IUserEditPersonalRequest)
    );
  }
);

export default UserController;
