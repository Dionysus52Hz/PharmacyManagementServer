import mysql from 'mysql2';
import 'dotenv/config';

const connection = mysql.createConnection({
    host: process.env.APP_HOST,
    database: process.env.DATABASE,
    user: 'root',
    password: process.env.PASSWORD,
});

export default connection;
