import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import userController from './src/routers/userRouter'
import teamController from './src/routers/teamRouter'
import { UserToken } from './src/types/token';

dotenv.config();

const app: Express = express();
app.use(express.json());
const port = process.env.PORT || 2000;
const token_secret = process.env.TOKEN_SECRET || '';

app.get('/verify', (req: Request, res: Response) => {
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
})

app.use("/user", userController);
app.use("/team", teamController);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
