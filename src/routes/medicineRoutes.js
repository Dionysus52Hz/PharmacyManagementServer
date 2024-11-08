// src/routes/medicineRoutes.js
import express from 'express';
import medicineController from '../controllers/medicineController.js';
import verifyToken from '../middlewares/verifyTokenMiddleware.js';

const router = express.Router();

router.get('/',medicineController.getMedicines);
// router.get('/:medicine_id', verifyToken.verifyAccessToken, medicineController.getMedicineById);
// router.post('/', verifyToken.verifyAccessToken, medicineController.createMedicine);
// router.put('/:medicine_id', verifyToken.verifyAccessToken, medicineController.updateMedicine);
// router.delete('/:medicine_id', verifyToken.verifyAccessToken, medicineController.deleteMedicine);

export default router;
