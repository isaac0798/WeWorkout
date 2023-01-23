import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client'
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const saltRounds = 10;

const prisma = new PrismaClient()

dotenv.config();

const app: Express = express();
app.use(express.json());
const port = process.env.PORT || 2000;
const token_secret = process.env.TOKEN_SECRET || '';

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.get('/users', async (req: Request, res: Response) => {
  const users = await prisma.user.findMany()
  res.send(users);
});

app.post('/signup', async (req: Request, res: Response) => {
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
      await prisma.user.create({data: {...body, password: hash}});
      const token = jwt.sign({foo: 'bar'}, token_secret, {})
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

app.post('/signin', async (req: Request, res: Response) => {
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
      res.json('F');
    }

    bcrypt.compare(body.password, user.password, function(err, result) {
      if (result) {
        const token = jwt.sign({user_id: user?.id}, token_secret, {})

        res.json({token});
      }
    })
  }

});

app.post('/verify', async (req: Request, res: Response) => {
  const authToken = req.get('Authorization');

  if (authToken) {
    const decodedToken = jwt.verify(authToken, token_secret) as any
    res.json(decodedToken)
  }

  res.json('invalid token fr');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
