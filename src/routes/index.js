import deliveryNoteRoutes from './DeliveryNoteRoutes.js';
import medicineRoutes from './medicineRoutes.js';
import receivedNoteRoutes from './receivedNoteRoutes.js';
import receivedNoteDetailsRoutes from './ReceivedNoteDetailsRoutes.js';
import deliveryNoteDetailsRoutes from './deliveryNoteDetailsRoutes.js';
import userRouter from './UserRouter.js';
import statisticRouter from './StatisticRouter.js';

const route = (app) => {
    app.use('/api/user', userRouter);
    app.use('/api/statistic', statisticRouter);
    app.use('/api/delivery-notes', deliveryNoteRoutes);
    app.use('/api/medicines', medicineRoutes);
    app.use('/api/receivednotes', receivedNoteRoutes);
    app.use('/api/received-note-details', receivedNoteDetailsRoutes);
    app.use('/api/delivery-note-details', deliveryNoteDetailsRoutes);
};

export default route;
