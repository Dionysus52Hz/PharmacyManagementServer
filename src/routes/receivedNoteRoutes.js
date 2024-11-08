// src/routes/receivedNoteRoutes.js
import express from 'express';
import receivedNoteController from '../controllers/receivedNoteController.js';
import verifyToken from '../middlewares/verifyTokenMiddleware.js';

const router = express.Router();

router.get('/', receivedNoteController.getReceivedNotes);
// router.get('/:received_note_id', verifyToken.verifyAccessToken, receivedNoteController.getReceivedNoteById);
// router.post('/', verifyToken.verifyAccessToken, receivedNoteController.createReceivedNote);
// router.put('/:received_note_id', verifyToken.verifyAccessToken, receivedNoteController.updateReceivedNote);
// router.delete('/:received_note_id', verifyToken.verifyAccessToken, receivedNoteController.deleteReceivedNote);

export default router;
