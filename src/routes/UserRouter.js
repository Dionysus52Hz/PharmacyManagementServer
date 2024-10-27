import express from 'express';
import UserController from '../controllers/UserController.js'; // thêm .js nếu cần
import { verifyAccessToken } from '../middlewares/verifyTokenMiddleware.js';

const router = express.Router();

router.post('/register', UserController.register);

export default router;
