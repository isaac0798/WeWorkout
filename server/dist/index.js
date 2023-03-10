"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userRouter_1 = __importDefault(require("./src/routers/userRouter"));
const teamRouter_1 = __importDefault(require("./src/routers/teamRouter"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
const port = process.env.PORT || 2000;
const token_secret = process.env.TOKEN_SECRET || '';
app.get('/verify', (req, res) => {
    const authToken = req.get('Authorization');
    if (!authToken) {
        res.status(403).json('No auth token found');
        return;
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(authToken, token_secret);
        res.json(decodedToken);
    }
    catch (err) {
        res.status(403).json(err);
    }
});
app.use("/user", userRouter_1.default);
app.use("/team", teamRouter_1.default);
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
