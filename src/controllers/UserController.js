import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

import connection from '../config/database.js';
import { generateAccessToken, generateRefreshToken } from '../middlewares/jwtMiddleware.js';

const register = async (req, res) => {
    const { username, password, fullname, address, phoneNumber, role = 'staff' } = req.body;

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
    const currentUsername = req.user.username;

    // Kiểm tra ít nhất một trường không để trống
    if (!fullname && !address && !phoneNumber) {
        return res.status(400).json({
            success: false,
            message: 'Bạn cần nhập ít nhất một trong các thông tin: họ tên, địa chỉ, hoặc số điện thoại để chỉnh sửa',
        });
    }
    if (phoneNumber && !/^\d{10}$/.test(phoneNumber)) {
        return res.status(400).json({ message: 'Số điện thoại phải đủ 10 kí tự' });
    }

    const [updatedUser] = await connection.promise().query('SELECT * FROM user WHERE username = ?', [username]);
    if (updatedUser.length === 0) {
        return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    const updatedUserRole = updatedUser[0].role;
    if (currentUserRole === updatedUserRole && currentUsername !== username) {
        return res
            .status(403)
            .json({ success: false, message: 'Không được chỉnh sửa thông tin người có role cùng cấp' });
    }
    if (currentUserRole === 'staff' && updatedUserRole !== 'user' && currentUsername !== username) {
        return res.status(403).json({ success: false, message: 'Nhân viên chỉ có thể sửa thông tin của người dùng' });
    }

    // Tạo câu lệnh cập nhật chỉ cho những trường đã có giá trị
    const updates = [];
    const values = [];

    if (fullname) {
        updates.push('fullname = ?');
        values.push(fullname);
    }
    if (address) {
        updates.push('address = ?');
        values.push(address);
    }
    if (phoneNumber) {
        updates.push('phoneNumber = ?');
        values.push(phoneNumber);
    }
    // Thêm username vào cuối để cập nhật cho đúng người dùng
    values.push(username);

    await connection.promise().query(`UPDATE user SET ${updates.join(', ')} WHERE username = ?`, values);
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

const getDetailUser = asyncHandler(async (req, res) => {
    const { username } = req.params; // Lấy username từ URL parameters

    // Kiểm tra xem người dùng có tồn tại không
    const [user] = await connection.promise().query('SELECT * FROM user WHERE username = ?', [username]);
    if (user.length === 0) {
        return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }
    const userInfo = {
        username: user[0].username,
        fullname: user[0].fullname,
        address: user[0].address,
        phoneNumber: user[0].phoneNumber,
        role: user[0].role,
        isLocked: user[0].isLocked, // Nếu cần, có thể thêm trường này
    };

    return res.status(200).json({ success: true, userInfo });
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

const filterUser = asyncHandler(async (req, res) => {
    const { query, sortBy = 'username', order = 'asc' } = req.query; // Lấy query tìm kiếm và thông tin sắp xếp từ request

    // Kiểm tra thông tin sắp xếp
    const validSortFields = ['username', 'address', 'fullname', 'phoneNumber'];
    if (!validSortFields.includes(sortBy)) {
        return res.status(400).json({ success: false, message: 'Thông tin sắp xếp không hợp lệ' });
    }

    const validOrder = ['asc', 'desc'];
    if (!validOrder.includes(order)) {
        return res.status(400).json({ success: false, message: 'Thứ tự sắp xếp không hợp lệ' });
    }

    // Kiểm tra nếu query là phoneNumber và chỉ cho phép số
    if (query && sortBy === 'phoneNumber' && isNaN(query)) {
        return res.status(400).json({ success: false, message: 'Query phải là số khi tìm kiếm theo số điện thoại.' });
    }

    // Tạo điều kiện tìm kiếm
    const searchCondition = query
        ? 'WHERE username LIKE ? OR address LIKE ? OR fullname LIKE ? OR phoneNumber LIKE ?'
        : '';
    const searchValues = query
        ? [
              `%${query}%`,
              `%${query}%`,
              `%${query}%`,
              `%${query}%`,
              //   query,
          ]
        : [];

    console.log('Search Condition:', searchCondition);
    console.log(
        `SELECT username, fullname, address, phoneNumber FROM user ${searchCondition} ORDER BY ${sortBy} ${order}`,
    );
    console.log('Search Values:', searchValues);
    // Thực hiện truy vấn
    const [users] = await connection
        .promise()
        .query(
            `SELECT username, fullname, address, phoneNumber FROM user ${searchCondition} ORDER BY ${sortBy} ${order}`,
            searchValues,
        );

    // const filteredUsers = users.filter(
    //     (user) =>
    //         user.phoneNumber.includes(query) ||
    //         user.username.includes(query) ||
    //         user.address.includes(query) ||
    //         user.fullname.includes(query),
    // );

    res.status(200).json({
        success: true,
        users,
        // filteredUsers,
    });
});

const changePassword = async (req, res) => {
    const { username } = req.user;
    const { currentPassword, newPassword } = req.body;

    try {
        console.log('username: ', username);
        console.log('currentPassword: ', currentPassword);
        console.log('newPassword: ', newPassword);
        // Kiểm tra xem người dùng đã cung cấp đầy đủ thông tin chưa
        if (!username || !currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Bạn cần cung cấp đủ thông tin để đổi mật khẩu.' });
        }

        // Kiểm tra mật khẩu mới
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res
                .status(400)
                .json({ message: 'Mật khẩu mới phải gồm kí tự in hoa, kí tự thường, số và kí tự đặc biệt' });
        }

        // Lấy thông tin người dùng từ cơ sở dữ liệu
        const [user] = await connection.promise().query('SELECT * FROM user WHERE username = ?', [username]);
        if (user.length === 0) {
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }

        // Kiểm tra mật khẩu hiện tại
        const isMatch = await bcrypt.compare(currentPassword, user[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng.' });
        }

        // Mã hóa mật khẩu mới
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await connection
            .promise()
            .query('UPDATE user SET password = ? WHERE username = ?', [hashedNewPassword, username]);

        console.log('Đổi mật khẩu thành công cho người dùng:', username);
        return res.status(200).json({ message: 'Đổi mật khẩu thành công.' });
    } catch (error) {
        console.error('Error in changing password:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
};

export default {
    register,
    login,
    logout,
    createUser,
    updateUser,
    deleteUser,
    searchUser,
    lockUser,
    getDetailUser,
    filterUser,
    changePassword,
};
