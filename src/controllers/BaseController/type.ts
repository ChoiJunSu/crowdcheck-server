import { Request, Response } from 'express-async-router';

export interface IBaseControllerRequest extends Request {}

export interface IBaseControllerResponse extends Response {
  ok: boolean;
  error: string;
}
