import { AsyncRouter } from 'express-async-router';
import {
  INextFunction,
  IRequest,
  IResponse,
} from '@controllers/BaseController/type';
import UserService from '@services/UserService';
import {
  IUserEditCorporateRequest,
  IUserEditPersonalRequest,
  IUserGetCorporateRequest,
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

UserController.get(
  '/get/corporate',
  AuthMiddleware.isCorporate,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    return res.send(
      await UserService.getCorporate({
        userId: req.user!.id,
      } as IUserGetCorporateRequest)
    );
  }
);

UserController.post(
  '/edit/personal',
  AuthMiddleware.isPersonal,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { password, careers } = req.body;

    return res.send(
      await UserService.editPersonal({
        userId: req.user!.id,
        password,
        careers,
      } as IUserEditPersonalRequest)
    );
  }
);

UserController.post(
  '/edit/corporate',
  AuthMiddleware.isCorporate,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { password } = req.body;

    return res.send(
      await UserService.editCorporate({
        userId: req.user!.id,
        password,
      } as IUserEditCorporateRequest)
    );
  }
);

export default UserController;
