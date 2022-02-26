import { AsyncRouter } from 'express-async-router';
import {
  INextFunction,
  IRequest,
  IResponse,
} from '@controllers/BaseController/type';
import UserService from '@services/UserService';
import {
  IUserCareerVerifyRequest,
  IUserEditCorporateRequest,
  IUserEditExpertRequest,
  IUserEditPersonalRequest,
  IUserGetCorporateRequest,
  IUserGetExpertRequest,
  IUserGetPersonalRequest,
} from '@services/UserService/type';
import AuthMiddleware from '@middlewares/AuthMiddleware';
import { MulterMiddleware } from '@middlewares/MultureMiddleware';

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

UserController.get(
  '/get/expert',
  AuthMiddleware.isExpert,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    return res.send(
      await UserService.getExpert({
        userId: req.user!.id,
      } as IUserGetExpertRequest)
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

UserController.post(
  '/edit/expert',
  AuthMiddleware.isExpert,
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { password } = req.body;

    return res.send(
      await UserService.editExpert({
        userId: req.user!.id,
        password,
      } as IUserEditExpertRequest)
    );
  }
);

UserController.post(
  '/career/verify',
  AuthMiddleware.isPersonal,
  MulterMiddleware.upload.single('certificate'),
  async (req: IRequest, res: IResponse, next: INextFunction) => {
    const { careerId } = req.body;
    if (!req.file)
      return res.send({ ok: false, error: '증빙자료를 업로드 해주세요.' });

    return res.send(
      await UserService.careerVerify({
        userId: req.user!.id,
        careerId,
        certificate: req.file,
      } as IUserCareerVerifyRequest)
    );
  }
);

export default UserController;
