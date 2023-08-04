import { Request } from 'express';
import jwt from 'jsonwebtoken';

export const tokenGen = (data: any, days?: number) => {
  return jwt.sign(data, process.env.JWT_KEY || '', {
    expiresIn: 60 * 60 * 24 * (days || 1) //1 day
  });
};

export const parseJwt = (token: string) => {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
};

export const getIdFromReq = (req: Request) => {
  const token = req.header('Authorization')?.slice(7); // cut Bearer
  const _id = parseJwt(token ?? '')._id;

  return _id;
};

export const generateCode = () => {
  const min = 100000;
  const max = 999999;
  const code = Math.floor(Math.random() * (max - min + 1)) + min;
  return code.toString();
};

export const resetPasswordTokenGen = (code: string, minutes?: number) => {
  const payload = { code };
  const token = jwt.sign(payload, process.env.JWT_KEY || '', {
    expiresIn: 60 * (minutes || 15) // 15 minutes
  });
  return token;
};
