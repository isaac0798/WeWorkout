"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRequest = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const token_secret = process.env.TOKEN_SECRET || '';
const verifyRequest = (req, res) => {
    const authToken = req.get('Authorization');
    if (!authToken) {
        res.status(403).json('No auth token found');
        return;
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(authToken, token_secret);
        return decodedToken;
    }
    catch (err) {
        res.status(403).json(err);
    }
};
exports.verifyRequest = verifyRequest;
