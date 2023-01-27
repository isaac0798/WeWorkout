import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import userController from './src/routers/userRouter'

dotenv.config();

const app: Express = express();
app.use(express.json());
const port = process.env.PORT || 2000;

/*async function verifyRequest(req: Request) {
  const authToken = req.get('Authorization');

  if (!authToken) {
    return ['', ]  
  }

  const decodedToken = jwt.verify(authToken, token_secret) as any
}*/

app.use("/user", userController);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
