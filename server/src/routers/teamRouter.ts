import { Router, Request, Response } from 'express';

import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client'
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const saltRounds = 10;

const prisma = new PrismaClient()
const teamController = Router();

dotenv.config();

export default userController;
