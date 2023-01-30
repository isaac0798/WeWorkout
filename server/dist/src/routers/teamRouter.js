"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const verifyRequest_1 = require("../utilities/verifyRequest");
const saltRounds = 10;
const prisma = new client_1.PrismaClient();
const teamController = (0, express_1.Router)();
const token_secret = process.env.TOKEN_SECRET || '';
dotenv_1.default.config();
teamController.get('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = (0, verifyRequest_1.verifyRequest)(req, res);
    if (!token) {
        res.status(403).json('No auth token found');
        return;
    }
    const body = req.body;
    const teamSchema = zod_1.z.object({
        teamname: zod_1.z.string().min(2),
        password: zod_1.z.string()
    });
    const valid = teamSchema.safeParse(body);
    if (!valid.success) {
        res.status(500).json('Invalid Team Details');
    }
    bcrypt_1.default.hash(body.password, saltRounds, function (err, hash) {
        return __awaiter(this, void 0, void 0, function* () {
            const team = yield prisma.team.create({});
        });
    });
}));
exports.default = teamController;
