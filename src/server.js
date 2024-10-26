import express from 'express';
import cors from 'cors';
import { env } from '~/config/environment';
import { StatusCodes } from 'http-status-codes';

const START_SERVER = () => {
    const app = express();

    app.use(cors());

    app.use(express.json());

    app.use('/', (req, res) => {
        res.status(StatusCodes.OK).json({
            status: 'Success',
            message: 'Welcome to our application.',
        });
    });

    app.listen(env.APP_PORT, env.APP_HOST, () => {
        console.log(`Pharamacy Server is running at http://${env.APP_HOST}:${env.APP_PORT}/`);
    });
};

try {
    START_SERVER();
} catch (error) {
    console.log('Cannot connect to server!', error);
    process.exit(0);
}
