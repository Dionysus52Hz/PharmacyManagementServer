import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId) => {
    return jwt.sign({ username: userId }, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: '3d' });
};
export const generateRefreshToken = (userId) => {
    return jwt.sign({ username: userId }, process.env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};
