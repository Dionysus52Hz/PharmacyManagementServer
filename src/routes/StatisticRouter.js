import express from 'express';
import StatisticController from '../controllers/StatisticController.js'; // thêm .js nếu cần
import { verifyAccessToken, checkAdminOrStaff } from '../middlewares/verifyTokenMiddleware.js';

const router = express.Router();

router.get('/day', [verifyAccessToken, checkAdminOrStaff], StatisticController.statisticDay);

export default router;
