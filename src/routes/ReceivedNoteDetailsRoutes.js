import express from 'express';
import receivedNoteDetailsController from '../controllers/ReceivedNoteDetailsController.js';

const router = express.Router();

router.get('/receivedNoteDetails', receivedNoteDetailsController.getAllReceivedNoteDetails);
router.get('/receivedNoteDetails/:received_note_id', receivedNoteDetailsController.getReceivedNoteDetailById);
router.post('/receivedNoteDetails', receivedNoteDetailsController.createReceivedNoteDetail);
router.put('/receivedNoteDetails/:received_note_id/:medicine_id', receivedNoteDetailsController.updateReceivedNoteDetail);
router.delete('/receivedNoteDetails/:received_note_id/:medicine_id', receivedNoteDetailsController.deleteReceivedNoteDetail);

export default router;
