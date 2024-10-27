import express from 'express';
import cors from 'cors';
import { StatusCodes } from 'http-status-codes';
import connection from './src/config/database.js';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import route from './src/routes/index.js';

const START_SERVER = () => {
    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    app.listen(process.env.APP_PORT, process.env.APP_HOST, () => {
        console.log(`Pharamacy Server is running at http://${process.env.APP_HOST}:${process.env.APP_PORT}/`);
        connection.connect((err) => {
            if (err) {
                console.error('Error connecting to the database:', err);
                process.exit(1);
            }
            console.log('Database connected');
        });
    });

    route(app);

    app.use('/', (req, res) => {
        res.status(StatusCodes.OK).json({
            status: 'Success',
            message: 'Welcome to our application.',
        });
    });
};

try {
    START_SERVER();
} catch (error) {
    console.log('Cannot connect to server!', error);
    process.exit(0);
}
