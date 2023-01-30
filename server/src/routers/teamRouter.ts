import { Router, Request, Response } from 'express';

import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client'
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { UserToken } from '../types/token';
import { verifyRequest } from '../utilities/verifyRequest';
const saltRounds = 10;

const prisma = new PrismaClient()
const teamController = Router();
const token_secret = process.env.TOKEN_SECRET || '';

dotenv.config();

teamController.post('/create', async (req: Request, res: Response) => {
  const token = verifyRequest(req, res);

  if (!token) {
    res.status(403).json('No auth token found');

    return;
  }

  const body = req.body;
  const teamSchema = z.object({
    teamname: z.string().min(2),
    password: z.string()
  });

  const valid = teamSchema.safeParse(body);

  if (!valid.success) {
    res.status(500).json('Invalid Team Details')
  }

  bcrypt.hash(body.password, saltRounds, async function(err, hash) {
    const user = await prisma.user.update({
      where: {
        id: token.user_id
      },
      data: {
        Team: {
          create: {
            teamname: body.teamname,
            password: hash
          }
        }
      },
      include: {
        Team: true
      }
    });

   res.json(user); 
  })
})

export default teamController;
