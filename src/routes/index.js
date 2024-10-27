import userRouter from './UserRouter.js';

const route = (app) => {
    app.use('/api/user', userRouter);
};

export default route;
