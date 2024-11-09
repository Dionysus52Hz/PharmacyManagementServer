import express from 'express';
import deliveryNoteDetailsController from '../controllers/deliveryNoteDetailsController.js';

const router = express.Router();

router.get('/', deliveryNoteDetailsController.getAllDeliveryNoteDetails);
router.get('/:id', deliveryNoteDetailsController.getDeliveryNoteDetailById);
router.post('/', deliveryNoteDetailsController.createDeliveryNoteDetail);
router.put('/:id', deliveryNoteDetailsController.updateDeliveryNoteDetail);
router.delete('/:id', deliveryNoteDetailsController.deleteDeliveryNoteDetail);

export default router;
