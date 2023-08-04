import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Token } from 'src/models';

export const validateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.slice(7); // cut Bearer

  if (!token) return res.status(401).send('Access Denied');
  const authToken = Token.findOne({ 'accessToken.token': token });
  if (!authToken) return res.status(401).send('Access Denied');

  try {
    if (!authToken) return res.status(401).send('Access Denied');
    jwt.verify(token, process.env.JWT_KEY || '');
    next();
  } catch (err) {
    return res.status(400).send('Invalid Token');
  }
};
