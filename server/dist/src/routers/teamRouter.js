"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const saltRounds = 10;
const prisma = new client_1.PrismaClient();
const teamController = (0, express_1.Router)();
dotenv_1.default.config();
exports.default = userController;
