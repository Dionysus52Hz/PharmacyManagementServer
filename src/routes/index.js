import userRouter from './UserRouter.js';
import deliveryNoteRoutes from './DeliveryNoteRoutes.js';
import medicineRoutes from './medicineRoutes.js';
import receivedNoteRoutes from './receivedNoteRoutes.js';

const route = (app) => {
    app.use('/api/user', userRouter);
    app.use('/api/delivery-notes', deliveryNoteRoutes);
    app.use('/api/medicines', medicineRoutes);
    app.use('/api/receivednotes', receivedNoteRoutes);
};


export default route;
