import jwt from 'jsonwebtoken';

export const generateAccessToken = (username, role) => {
    return jwt.sign({ username, role }, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: '2d' });
};
export const generateRefreshToken = (username) => {
    return jwt.sign({ username }, process.env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};


