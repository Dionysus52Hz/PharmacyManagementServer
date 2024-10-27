import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

import connection from '../config/database.js';
import { generateAccessToken, generateRefreshToken } from '../middlewares/jwtMiddleware.js';

const register = async (req, res, next) => {
    const { username, password, fullname, address, phoneNumber } = req.body;

    try {
        if (!username || !password || !fullname || !address || !phoneNumber) {
            return res.status(400).json({ message: 'Bạn cần cung cấp đầy đủ thông tin.' });
        }

        // Kiểm tra mật khẩu
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res
                .status(400)
                .json({ message: 'Mật khẩu phải gồm kí tự in hoa, kí tự thường, số và kí tự đặc biệt' });
        }

        // Kiểm tra số điện thoại
        if (!/^\d{10}$/.test(phoneNumber)) {
            return res.status(400).json({ message: 'Số điện thoại phải đủ 10 kí tự' });
        }

        // Kiểm tra người dùng đã tồn tại
        const [existingUser] = await connection.promise().query('SELECT * FROM user WHERE username = ?', [username]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Username đã tồn tại.' });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);
        await connection
            .promise()
            .query('INSERT INTO user (username, password, fullname, address, phoneNumber) VALUES (?, ?, ?, ?, ?)', [
                username,
                hashedPassword,
                fullname,
                address,
                phoneNumber,
            ]);

        const [newUser] = await connection
            .promise()
            .query('SELECT username, password, fullname, address, phoneNumber FROM user WHERE username = ?', [
                username,
            ]);

        console.log('Đăng ký thành công:', newUser[0]);

        return res.status(201).json({ success: true, message: 'Đăng ký tài khoản thành công', user: newUser[0] });
    } catch (error) {
        console.error('Error in registration:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
};

export default {
    register,
};
