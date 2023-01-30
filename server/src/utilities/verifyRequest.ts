import { Request, Response } from 'express';
import { UserToken } from "../types/token";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const token_secret = process.env.TOKEN_SECRET || '';

export const verifyRequest = (req: Request, res: Response): UserToken | void => {
  const authToken = req.get('Authorization');

  if (!authToken) {
    res.status(403).json('No auth token found');

    return;
  }

  try {
    const decodedToken = jwt.verify(authToken, token_secret) as UserToken
    res.json(decodedToken)
  } catch (err) {
    res.status(403).json(err)
  }
}

