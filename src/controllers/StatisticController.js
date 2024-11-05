import asyncHandler from 'express-async-handler';

import connection from '../config/database.js';

const statisticDay = asyncHandler(async (req, res) => {});

export default {
    statisticDay,
};
