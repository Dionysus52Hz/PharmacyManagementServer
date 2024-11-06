// src/routes/medicineRoutes.js
import express from 'express';
import medicineController from '../controllers/medicineController.js';
import verifyToken from '../middlewares/verifyTokenMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, medicineController.getMedicines);
router.get('/:medicine_id', verifyToken, medicineController.getMedicineById);
router.post('/', verifyToken, medicineController.createMedicine);
router.put('/:medicine_id', verifyToken, medicineController.updateMedicine);
router.delete('/:medicine_id', verifyToken, medicineController.deleteMedicine);

export default router;
