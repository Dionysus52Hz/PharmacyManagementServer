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

    // Check if the user is locked
    if (user[0].isLocked) {
        return res.status(403).json({ success: false, message: 'Tài khoản của bạn đã bị khóa' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Mật khẩu không đúng' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user[0].username, user[0].role);
    const refreshToken = generateRefreshToken(user[0].username);

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
        accessToken,
        user: userInfo,
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

const createUser = asyncHandler(async (req, res) => {
    const { username, password, fullname, address, phoneNumber, role } = req.body;
    const currentRoleUser = req.user.role;

    // Kiểm tra dữ liệu đầu vào
    if (!username) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp username' });
    }

    const finalPassword = password || '123456';

    // Kiểm tra số điện thoại
    if (phoneNumber && !/^\d{10}$/.test(phoneNumber)) {
        return res.status(400).json({ message: 'Số điện thoại phải đủ 10 kí tự' });
    }

    // Kiểm tra người dùng đã tồn tại
    const [existingUser] = await connection.promise().query('SELECT * FROM user WHERE username = ?', [username]);
    if (existingUser.length > 0) {
        return res.status(400).json({ success: false, message: 'Username đã tồn tại. Hãy đăng kí username khác' });
    }

    const inputRole = currentRoleUser === 'staff' ? 'user' : role;
    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(finalPassword, 10);
    await connection
        .promise()
        .query(
            'INSERT INTO user (username, password, fullname, address, phoneNumber, role) VALUES (?, ?, ?, ?, ?, ?)',
            [username, hashedPassword, fullname, address, phoneNumber, inputRole || 'user'],
        );

    const [newUser] = await connection
        .promise()
        .query('SELECT username, fullname, address, phoneNumber, role FROM user WHERE username = ?', [username]);

    console.log('Đăng ký thành công:', newUser[0]);

    res.status(201).json({ success: true, message: 'Tạo người dùng thành công', newUser });
});

const updateUser = asyncHandler(async (req, res) => {
    const { username } = req.params; // Username to update, from URL
    const { fullname, address, phoneNumber } = req.body; // Updated information
    const currentUserRole = req.user.role; // Requesting user's role from JWT or session

    if (!fullname || !address || !phoneNumber) {
        return res.status(404).json({
            success: false,
            message: 'Bạn cần nhập họ tên, địa chỉ, hoặc sđt để chỉnh sửa',
        });
    }
    if (!/^\d{10}$/.test(phoneNumber)) {
        return res.status(400).json({ message: 'Số điện thoại phải đủ 10 kí tự' });
    }

    const [updatedUser] = await connection.promise().query('SELECT * FROM user WHERE username = ?', [username]);
    if (updatedUser.length === 0) {
        return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    const updatedUserRole = updatedUser[0].role;
    if (currentUserRole === updatedUserRole) {
        return res
            .status(403)
            .json({ success: false, message: 'Không được chỉnh sửa thông tin người có role cùng cấp' });
    }
    if (currentUserRole === 'staff' && updatedUserRole !== 'user') {
        return res.status(403).json({ success: false, message: 'Nhân viên chỉ có thể sửa thông tin của người dùng' });
    }

    await connection
        .promise()
        .query('UPDATE user SET fullname = ?, address = ?, phoneNumber = ? WHERE username = ?', [
            fullname,
            address,
            phoneNumber,
            username,
        ]);
    return res.status(200).json({ success: true, message: `Cập nhật thông tin người dùng ${username} thành công` });
});

const deleteUser = asyncHandler(async (req, res) => {
    const { username } = req.params; // Assuming the username to delete is passed as a URL parameter
    const currentRoleUser = req.user.role; // The role of the requesting user, e.g., from JWT

    // Check if the requesting user has permission to delete
    if (currentRoleUser !== 'admin') {
        return res.status(403).json({ success: false, message: 'Chỉ có admin mới được phép xóa người dùng' });
    }

    // Check if the user exists
    const [user] = await connection.promise().query('SELECT * FROM user WHERE username = ?', [username]);
    if (user.length === 0) {
        return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    const deletedRoleUser = user[0].role;
    // Prevent deletion of users with the same role
    if (deletedRoleUser === currentRoleUser) {
        return res.status(401).json({ success: false, message: 'Không được xoá ngưười có role cùng cấp' });
    }

    // Proceed with deletion
    await connection.promise().query('DELETE FROM user WHERE username = ?', [username]);
    console.log(`Xóa thành công người dùng ${username}`);

    return res.status(200).json({ success: true, message: `Xóa thành công người dùng ${username}` });
});

const lockUser = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const currentRole = req.user.role;
    const currentUsername = req.user.username;

    // Kiểm tra người dùng tồn tại
    const [user] = await connection.promise().query('SELECT * FROM user WHERE username = ?', [username]);
    if (user.length === 0) {
        return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    const targetRoleUser = user[0].role;
    const targetIsLocked = user[0].isLocked;

    // Khoá/mở khoá chính mình
    if (username === currentUsername) {
        return res.status(403).json({ success: false, message: 'Không được khóa/mở khóa chính mình' });
    }
    // Khoá/mở khoá người cùng role
    if (currentRole === targetRoleUser) {
        return res.status(403).json({ success: false, message: 'Không được khoá/mở khoá người cùng chức vụ' });
    }
    // Khoá/mở khoá cho staff
    if (currentRole === 'staff' && targetRoleUser !== 'user') {
        return res.status(403).json({ success: false, message: 'Staff chỉ có thể khóa/mở khóa user' });
    }

    // Đảo ngược trạng thái khóa/mở khóa
    const newIsLocked = !targetIsLocked;
    await connection.promise().query('UPDATE user SET isLocked = ? WHERE username = ?', [newIsLocked, username]);
    const action = newIsLocked ? 'Khóa' : 'Mở Khóa';
    console.log(`User ${username} đã được ${action} bởi ${currentRole}`);

    return res.status(200).json({ success: true, message: `${action} tài khoản người dùng ${username}` });
});

const searchUser = asyncHandler(async (req, res) => {
    const { username } = req.query; // Search term from the query parameter
    if (!username) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp tên người dùng để tìm kiếm' });
    }
    const [user] = await connection
        .promise()
        .query('SELECT username, fullname, address, phoneNumber, role FROM user WHERE username LIKE ?', [
            `%${username}%`,
        ]);
    if (user.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng nào' });
    }
    return res.status(200).json({ success: true, user });
});

export default {
    register,
    login,
    logout,
    createUser,
    updateUser,
    deleteUser,
    searchUser,
    lockUser,
};
