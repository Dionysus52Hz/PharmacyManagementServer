import userRouter from './UserRouter.js';
import statisticRouter from './StatisticRouter.js';

const route = (app) => {
    app.use('/api/user', userRouter);
    app.use('/api/statistic', statisticRouter);
};

export default route;
