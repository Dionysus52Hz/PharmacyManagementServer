// src/controllers/deliveryNoteController.js
const pool = require('../config/database');

// Lấy danh sách tất cả Delivery Notes
const getDeliveryNotes = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM DeliveryNotes');
    res.json(rows);
  } catch (error) {
    res.status(500).send('Error fetching delivery notes');
  }
};

// Lấy chi tiết của một Delivery Note theo ID
const getDeliveryNoteById = async (req, res) => {
  const { delivery_note_id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM DeliveryNotes WHERE delivery_note_id = ?', [delivery_note_id]);
    if (rows.length === 0) {
      return res.status(404).send('Delivery note not found');
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).send('Error fetching delivery note');
  }
};

// Tạo mới một Delivery Note
const createDeliveryNote = async (req, res) => {
  const { employee_id, customer_id, delivery_date } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO DeliveryNotes (employee_id, customer_id, delivery_date) VALUES (?, ?, ?)',
      [employee_id, customer_id, delivery_date]
    );
    res.status(201).json({ delivery_note_id: result.insertId });
  } catch (error) {
    res.status(500).send('Error creating delivery note');
  }
};

// Xóa một Delivery Note theo ID
const deleteDeliveryNote = async (req, res) => {
  const { delivery_note_id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM DeliveryNotes WHERE delivery_note_id = ?', [delivery_note_id]);
    if (result.affectedRows === 0) {
      return res.status(404).send('Delivery note not found');
    }
    res.status(200).send('Delivery note deleted');
  } catch (error) {
    res.status(500).send('Error deleting delivery note');
  }
};

export default {
  getDeliveryNotes,
  getDeliveryNoteById,
  createDeliveryNote,
  deleteDeliveryNote,
};
