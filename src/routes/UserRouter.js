import express from 'express';
import UserController from '../controllers/UserController.js'; // thêm .js nếu cần
import { verifyAccessToken, checkAdminOrStaff } from '../middlewares/verifyTokenMiddleware.js';

const router = express.Router();

router.put('/updateUser/:username', [verifyAccessToken, checkAdminOrStaff], UserController.updateUser);
router.delete('/deleteUser/:username', [verifyAccessToken, checkAdminOrStaff], UserController.deleteUser);
router.put('/lockUser/:username', [verifyAccessToken, checkAdminOrStaff], UserController.lockUser);
router.get('/getDetailUser/:username', [verifyAccessToken, checkAdminOrStaff], UserController.getDetailUser);

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/logout', UserController.logout);
router.post('/createUser', [verifyAccessToken, checkAdminOrStaff], UserController.createUser);
router.post('/searchUser', [verifyAccessToken, checkAdminOrStaff], UserController.searchUser);

export default router;
