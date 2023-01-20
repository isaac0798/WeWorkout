import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client'
import { z } from 'zod';

const prisma = new PrismaClient()

dotenv.config();

const app: Express = express();
app.use(express.json());
const port = process.env.PORT || 2000;

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.get('/users', async (req: Request, res: Response) => {
  const users = await prisma.user.findMany()
  res.send(users);
});

app.post('/user', async (req: Request, res: Response) => {
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
    res.json({requestBody: req.body})
  } else {
    res.json({error: valid.error})
  }

});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
