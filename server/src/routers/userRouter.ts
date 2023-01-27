import { Router, Request, Response } from 'express';

import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client'
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const saltRounds = 10;

const prisma = new PrismaClient()
const userController = Router();

dotenv.config();
const token_secret = process.env.TOKEN_SECRET || '';

async function verifyRequest(req: Request) {
  const authToken = req.get('Authorization');

  if (!authToken) {
    return ['', ]  
  }

  const decodedToken = jwt.verify(authToken, token_secret) as any
  console.dir(decodedToken, {depth: null});
}

userController.get('/users', async (req: Request, res: Response) => {
  const users = await prisma.user.findMany()
  res.send(users);
});

userController.post('/signup', async (req: Request, res: Response) => {
  const body = req.body;
  const userSchema = z.object({
      firstname: z.string().min(2).max(20),
      lastname: z.string().min(2).max(20),
      username: z.string().min(2).max(20),
      email: z.string().email(),
      password: z.string()
    }).required();

  const valid = userSchema.safeParse(body);

  if (valid.success) {
    bcrypt.hash(body.password, saltRounds, async function(err, hash) {
      const user = await prisma.user.create({data: {...body, password: hash}});
      const token = jwt.sign({user_id: user.id}, token_secret, {})
      res.json(
        {
          requestBody: body,
          token
        }
      )
    });
  } else {
    res.json({error: valid.error})
  }
});

userController.post('/signin', async (req: Request, res: Response) => {
  const body = req.body;
  const userSchema = z.object({
      username: z.string().min(2).max(20),
      password: z.string()
    }).required();

  const valid = userSchema.safeParse(body);

  if (valid.success) {
    const user = await prisma.user.findUnique({
      where: {
        username: body.username
      }
    });

    if (!user || !user.password) {
      res.json("Error: That username is not found");
    }

    bcrypt.compare(body.password, user.password, function(err, result) {
      if (err) {
        res.json("Wrong Password");
      }

      if (result) {
        const token = jwt.sign({user_id: user?.id}, token_secret, { expiresIn: '1h'})

        res.json({token});
      }
    })
  }

});

export default userController;
