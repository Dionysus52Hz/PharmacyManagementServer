<<<<<<< HEAD
import deliveryNoteRoutes from './DeliveryNoteRoutes.js';
import medicineRoutes from './medicineRoutes.js';
import receivedNoteRoutes from './receivedNoteRoutes.js';
import receivedNoteDetailsRoutes from './ReceivedNoteDetailsRoutes.js';
import deliveryNoteDetailsRoutes from './deliveryNoteDetailsRoutes.js';


const route = (app) => {
    app.use('/api/delivery-notes', deliveryNoteRoutes);
    app.use('/api/medicines', medicineRoutes);
    app.use('/api/receivednotes', receivedNoteRoutes);
    app.use('/api', receivedNoteDetailsRoutes);
    app.use('/api/delivery-note-details', deliveryNoteDetailsRoutes);
};

=======
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
>>>>>>> 2f6d4d1085de4557def25fba539d1ba30216112d

export default route;
