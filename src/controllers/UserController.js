import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

import connection from '../config/database.js';
import { generateAccessToken, generateRefreshToken } from '../middlewares/jwtMiddleware.js';

const register = async (req, res) => {
    const { username, password, fullname, address, phoneNumber, role = 'user' } = req.body;

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
            return res.status(400).json({ message: 'Username đã tồn tại. Hãy đăng kí username khác' });
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
                role,
            ]);

        const [newUser] = await connection
            .promise()
            .query('SELECT username, password, fullname, address, phoneNumber, role FROM user WHERE username = ?', [
                username,
            ]);

        console.log('Đăng ký thành công:', newUser[0]);

        return res.status(201).json({ success: true, message: 'Đăng ký tài khoản thành công', user: newUser[0] });
    } catch (error) {
        console.error('Error in registration:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
};

const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Người dùng cần nhập username và password',
        });
    }

    // Check if the user exists
    const [user] = await connection.promise().query('SELECT * FROM user WHERE username = ?', [username]);

    if (user.length === 0) {
        return res.status(404).json({ success: false, message: 'Tài khoản không tồn tại' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Mật khẩu không đúng' });
    }

    // Generate tokens
    const accessToken = generateAccessToken({ username: user[0].username });
    const refreshToken = generateRefreshToken({ username: user[0].username });

    const userInfo = {
        username: user[0].username,
        fullname: user[0].fullname,
        address: user[0].address,
        phoneNumber: user[0].phoneNumber,
        role: user[0].role,
    };

    await connection.promise().query('UPDATE user SET refreshToken = ? WHERE username = ?', [refreshToken, username]);

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 * 7, // 7 day expires refreshToken
    });

    res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công',
        user: userInfo,
        accessToken,
    });
});

const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies;

    // Check if the refreshToken exists in cookies
    if (!cookie || !cookie.refreshToken) {
        return res.status(400).json({ success: false, message: 'Not found refresh token in cookies' });
    }

    // Delete refreshToken from the database
    const [result] = await connection
        .promise()
        .query('UPDATE user SET refreshToken = NULL WHERE refreshToken = ?', [cookie.refreshToken]);

    if (result.affectedRows === 0) {
        return res.status(400).json({ success: false, message: 'Refresh token not found in the database' });
    }
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
    });
    return res.status(200).json({
        success: true,
        message: 'Đăng xuất thành công',
    });
});

export default {
    register,
    login,
    logout,
};
