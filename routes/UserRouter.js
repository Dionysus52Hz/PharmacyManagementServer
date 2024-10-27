import express from 'express';
import UserController from '../controllers/UserController.js'; // thêm .js nếu cần
import { verifyAccessToken, checkIsStaff, checkIsAdmin } from '../middlewares/verifyTokenMiddleware.js'; // thêm .js nếu cần

const router = express.Router();

router.post('/register', [verifyAccessToken, checkIsAdmin], UserController.register);

export default router; // sử dụng export default thay cho module.exports
