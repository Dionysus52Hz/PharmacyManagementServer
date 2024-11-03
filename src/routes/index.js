import userRouter from './UserRouter.js';
const InvoiceRouter = require('./InvoiceRouter.js');
const express = require('express');

const route = (app) => {
    app.use('/api/user', userRouter);
};

const router = express.Router();
router.use('/invoices', InvoiceRouter);

export default route;
