import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId, isAdmin, role) => {
    return jwt.sign({ _id: userId, isAdmin, role }, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
};
export const generateRefreshToken = (userId) => {
    return jwt.sign({ _id: userId }, process.env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};
