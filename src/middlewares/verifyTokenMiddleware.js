import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';

export const verifyAccessToken = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization;
    if (req?.headers?.authorization.startsWith('Bearer')) {
        const accessToken = token.split(' ')[1];
        jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid access token',
                });
            }
            req.user = user;
            next();
        });
    } else {
        return res.status(401).json({
            success: false,
            message: 'Not verify access token. Require authentication',
        });
    }
});

export const checkIsStaff = asyncHandler(async (req, res, next) => {
    const { isAdmin, role } = req.user;
    if (role !== 'staff') {
        res.status(401).json({
            success: false,
            message: 'Require admin role',
        });
    }
    next();
});

export const checkIsAdmin = asyncHandler(async (req, res, next) => {
    const { isAdmin, role } = req.user;
    if (isAdmin === false && role !== 'admin') {
        res.status(401).json({
            success: false,
            message: 'Require admin role',
        });
    }
    if (isAdmin === true || role === 'admin') next();
});

export const checkAdminOrStaff = (req, res, next) => {
    checkIsAdmin((req, res), (err) => {
        if (err) {
            checkIsStaff(req, res, (err) => {
                if (err) {
                    return res.status(403).json({ message: 'Access denied staff' });
                } else {
                    next();
                }
            });
        } else {
            next();
        }
    });
};

// export default { verifyAccessToken, checkIsStaff, checkIsAdmin, checkAdminOrStaff };
