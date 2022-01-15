import { Request, Response, NextFunction } from 'express-async-router';
import { IAuthTokenPayload } from '@services/AuthService/type';

export interface IRequest extends Request {
  user?: IAuthTokenPayload;
}

export interface IResponse extends Response {}

export interface INextFunction extends NextFunction {}
