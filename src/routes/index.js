import userRouter from './UserRouter.js';

const express = require('express');
import invoiceRouter from './InvoiceRouter.js';
import statisticRouter from './StatisticRouter.js';

const route = (app) => {
    app.use('/api/user', userRouter);
    app.use('/api/statistic', statisticRouter);
    app.use('/api/invoices', invoiceRouter);
};

const router = express.Router();

export default route;
