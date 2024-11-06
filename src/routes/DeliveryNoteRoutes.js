
const express = require('express');
const { getDeliveryNotes, getDeliveryNoteById, createDeliveryNote, deleteDeliveryNote } = require('../controllers/DeliveryNoteController');
const verifyToken = require('../middlewares/verifyTokenMiddleware');

const router = express.Router();

router.get('/', verifyToken, getDeliveryNotes);
router.get('/:delivery_note_id', verifyToken, getDeliveryNoteById);
router.post('/', verifyToken, createDeliveryNote);
router.delete('/:delivery_note_id', verifyToken, deleteDeliveryNote);

export default router;
