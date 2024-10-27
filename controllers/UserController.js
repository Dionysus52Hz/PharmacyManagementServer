import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

import { generateAccessToken, generateRefreshToken } from '../middlewares/jwtMiddleware.js';

const register = asyncHandler(async (req, res, next) => {
    const { email, password, firstName, lastName } = req.body;
});

export default {
    register,
};
