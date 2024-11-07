import asyncHandler from 'express-async-handler';

import connection from '../config/database.js';

const statisticDay = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query; // Lấy tham số startDate và endDate từ query params

    // Kiểm tra nếu startDate hoặc endDate không được cung cấp
    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    // Câu truy vấn SQL để lấy thống kê hóa đơn nhận hàng trong khoảng thời gian
    const query = `
    SELECT 
      rn.received_note_id,
      rn.employee_id,
      rn.supplier_id,
      rn.received_date,
      rnd.medicine_id,
      rnd.quantity,
      rnd.price
    FROM 
      ReceiveNotes rn
    JOIN 
      ReceivedNotesDetails rnd ON rn.received_note_id = rnd.received_note_id
    WHERE 
      DATE(rn.received_date) BETWEEN ? AND ?;
  `;

    const [results] = await connection.promise().query(query, [startDate, endDate]);
    console.log('results: ', results);

    // Trả về kết quả dưới dạng JSON
    return res.status(200).json({
        success: true,
        results,
    });
});

export default {
    statisticDay,
};
