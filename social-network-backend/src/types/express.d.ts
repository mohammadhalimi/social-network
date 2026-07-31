import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

declare module 'express' {
  export interface Request {
    cookies: {
      token?: string;
      [key: string]: any;
    };
    res: ExpressResponse;
  }
}