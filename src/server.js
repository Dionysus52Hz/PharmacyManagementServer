import express from 'express';
import cors from 'cors';
import { StatusCodes } from 'http-status-codes';
import connection from './config/database';
import 'dotenv/config';

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

    app.listen(process.env.APP_PORT, process.env.APP_HOST, () => {
        console.log(`Pharamacy Server is running at http://${process.env.APP_HOST}:${process.env.APP_PORT}/`);
        connection.connect((err) => {
            if (err) throw err;
            console.log('Database connected');
        });
    });
};

try {
    START_SERVER();
} catch (error) {
    console.log('Cannot connect to server!', error);
    process.exit(0);
}
