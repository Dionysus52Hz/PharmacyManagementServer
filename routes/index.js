import userRouter from './UserRouter';

const route = (app) => {
    app.use('/api/user', userRouter);
};

export default route;
