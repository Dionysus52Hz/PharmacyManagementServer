// src/routes/InvoiceRouter.js
const express = require('express');
const InvoiceController = require('../controllers/InvoiceController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

const router = express.Router();

router.post('/', jwtMiddleware, InvoiceController.createInvoice);
router.get('/', jwtMiddleware, InvoiceController.getInvoices);
router.put('/:id', jwtMiddleware, InvoiceController.updateInvoice);
router.get('/search', jwtMiddleware, InvoiceController.searchInvoices);
module.exports = router;
