// src/routes/receivedNoteRoutes.js
import express from 'express';
import receivedNoteController from '../controllers/receivedNoteController.js';
import verifyToken from '../middlewares/verifyTokenMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, receivedNoteController.getReceivedNotes);
router.get('/:received_note_id', verifyToken, receivedNoteController.getReceivedNoteById);
router.post('/', verifyToken, receivedNoteController.createReceivedNote);
router.put('/:received_note_id', verifyToken, receivedNoteController.updateReceivedNote);
router.delete('/:received_note_id', verifyToken, receivedNoteController.deleteReceivedNote);

export default router;
