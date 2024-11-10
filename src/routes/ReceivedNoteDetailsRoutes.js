import express from 'express';
import receivedNoteDetailsController from '../controllers/ReceivedNoteDetailsController.js';

const router = express.Router();

router.get('/', receivedNoteDetailsController.getAllReceivedNoteDetails);
router.get('/:received-note-id', receivedNoteDetailsController.getReceivedNoteDetailById);
router.post('/', receivedNoteDetailsController.createReceivedNoteDetail);
router.put('/:received-note-id/:medicine_id', receivedNoteDetailsController.updateReceivedNoteDetail);
router.delete('/:received-note-id/:medicine_id', receivedNoteDetailsController.deleteReceivedNoteDetail);

export default router;
