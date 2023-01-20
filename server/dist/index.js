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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
const port = process.env.PORT || 2000;
app.get('/', (req, res) => {
    res.send('Express + TypeScript Server');
});
app.get('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield prisma.user.findMany();
    res.send(users);
}));
app.post('/user', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        res.json({ requestBody: req.body });
    }
    else {
        res.json({ error: valid.error });
    }
}));
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
