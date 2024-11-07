import asyncHandler from 'express-async-handler';

import connection from '../config/database.js';

const statisticDay = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query; // Lấy tham số startDate và endDate từ query params

    // Kiểm tra nếu startDate hoặc endDate không được cung cấp
    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    // Phiếu nhập
    // Câu truy vấn SQL để lấy thống kê hóa đơn nhận hàng trong khoảng thời gian
    const queryListInput = `
    SELECT 
      rn.received_note_id,
      rn.employee_id,
      rn.supplier_id,
      CONVERT_TZ(rn.received_date, '+00:00', '+07:00') AS received_date,
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

    const [resultsInput] = await connection.promise().query(queryListInput, [startDate, endDate]);

    const maxPriceRowInput = resultsInput.reduce((max, row) => (row.price > max.price ? row : max), resultsInput[0]);
    const minPriceRowInput = resultsInput.reduce((min, row) => (row.price < min.price ? row : min), resultsInput[0]);

    const totalPriceInput = resultsInput.reduce((sum, row) => sum + row.price, 0);
    const avgPriceInput = totalPriceInput / resultsInput.length;

    // Phiếu chi
    // Câu truy vấn SQL để lấy thống kê hóa đơn nhận hàng trong khoảng thời gian
    const queryListOutput = `
    SELECT 
      dv.delivery_note_id,
      dv.employee_id,
      dv.customer_id,
      CONVERT_TZ(dv.delivery_date, '+00:00', '+07:00') AS delivery_date,
      dvd.medicine_id,
      dvd.quantity,
      dvd.price
    FROM 
      DeliveryNotes dv
    JOIN 
      DeliveryNoteDetails dvd ON dv.delivery_note_id = dvd.delivery_note_id
    WHERE 
      DATE(dv.delivery_date) BETWEEN ? AND ?;
  `;

    const [resultsOutput] = await connection.promise().query(queryListOutput, [startDate, endDate]);

    const maxPriceRowOutput = resultsOutput.reduce((max, row) => (row.price > max.price ? row : max), resultsOutput[0]);
    const minPriceRowOutput = resultsOutput.reduce((min, row) => (row.price < min.price ? row : min), resultsOutput[0]);

    const totalPriceOutput = resultsOutput.reduce((sum, row) => sum + row.price, 0);
    const avgPriceOutput = totalPriceOutput / resultsOutput.length;

    const totalProfit = totalPriceInput - totalPriceOutput;

    // Trả về kết quả dưới dạng JSON
    return res.status(200).json({
        success: true,
        resultsInput,
        maxPriceRowInput,
        minPriceRowInput,
        avgPriceInput,
        resultsOutput,
        maxPriceRowOutput,
        minPriceRowOutput,
        avgPriceOutput,
        totalPriceInput,
        totalPriceOutput,
        totalProfit,
    });
});

export default {
    statisticDay,
};
