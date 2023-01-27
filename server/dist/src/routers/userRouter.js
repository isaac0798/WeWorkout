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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const saltRounds = 10;
const prisma = new client_1.PrismaClient();
const userController = (0, express_1.Router)();
dotenv_1.default.config();
const token_secret = process.env.TOKEN_SECRET || '';
function verifyRequest(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const authToken = req.get('Authorization');
        if (!authToken) {
            return ['',];
        }
        const decodedToken = jsonwebtoken_1.default.verify(authToken, token_secret);
        console.dir(decodedToken, { depth: null });
    });
}
userController.get('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield prisma.user.findMany();
    res.send(users);
}));
userController.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const userSchema = zod_1.z.object({
        firstname: zod_1.z.string().min(2).max(20),
        lastname: zod_1.z.string().min(2).max(20),
        username: zod_1.z.string().min(2).max(20),
        email: zod_1.z.string().email(),
        password: zod_1.z.string()
    }).required();
    const valid = userSchema.safeParse(body);
    if (valid.success) {
        bcrypt_1.default.hash(body.password, saltRounds, function (err, hash) {
            return __awaiter(this, void 0, void 0, function* () {
                const user = yield prisma.user.create({ data: Object.assign(Object.assign({}, body), { password: hash }) });
                const token = jsonwebtoken_1.default.sign({ user_id: user.id }, token_secret, {});
                res.json({
                    requestBody: body,
                    token
                });
            });
        });
    }
    else {
        res.json({ error: valid.error });
    }
}));
userController.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const userSchema = zod_1.z.object({
        username: zod_1.z.string().min(2).max(20),
        password: zod_1.z.string()
    }).required();
    const valid = userSchema.safeParse(body);
    if (valid.success) {
        const user = yield prisma.user.findUnique({
            where: {
                username: body.username
            }
        });
        if (!user || !user.password) {
            res.json("Error: That username is not found");
        }
        bcrypt_1.default.compare(body.password, user.password, function (err, result) {
            if (err) {
                res.json("Wrong Password");
            }
            if (result) {
                const token = jsonwebtoken_1.default.sign({ user_id: user === null || user === void 0 ? void 0 : user.id }, token_secret, { expiresIn: '1h' });
                res.json({ token });
            }
        });
    }
}));
exports.default = userController;
