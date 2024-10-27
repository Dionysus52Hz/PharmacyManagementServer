import express from 'express';
import UserController from '../controllers/UserController.js'; // thêm .js nếu cần
import { verifyAccessToken, checkAdminOrStaff } from '../middlewares/verifyTokenMiddleware.js';

const router = express.Router();

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/logout', UserController.logout);
router.post('/createUser', [verifyAccessToken, checkAdminOrStaff], UserController.createUser);

export default router;
