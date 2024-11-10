// src/controllers/receivedNoteController.js
import connection from '../config/database.js';

// Lấy danh sách tất cả các phiếu nhập
const getReceivedNotes = async (req, res) => {
    try {
        const [rows] = await connection.query('SELECT * FROM ReceivedNotes');
        res.json(rows);
    } catch (error) {
        res.status(500).send('Error fetching received notes');
    }
};

// Lấy chi tiết một phiếu nhập theo ID
const getReceivedNoteById = async (req, res) => {
    const { received_note_id } = req.params;
    try {
        const [rows] = await connection.query('SELECT * FROM ReceivedNotes WHERE received_note_id = ?', [received_note_id]);
        if (rows.length === 0) {
            return res.status(404).send('Received note not found');
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).send('Error fetching received note');
    }
};

// Tạo mới một phiếu nhập
const createReceivedNote = async (req, res) => {
    const { employee_id, supplier_id, received_date } = req.body;
    try {
        const [result] = await connection.query(
            'INSERT INTO ReceivedNotes (employee_id, supplier_id, received_date) VALUES (?, ?, ?)',
            [employee_id, supplier_id, received_date]
        );
        res.status(201).json({ received_note_id: result.insertId });
    } catch (error) {
        res.status(500).send('Error creating received note');
    }
};

// Cập nhật thông tin một phiếu nhập
const updateReceivedNote = async (req, res) => {
    const { received_note_id } = req.params;
    const { employee_id, supplier_id, received_date } = req.body;
    try {
        const [result] = await connection.query(
            'UPDATE ReceivedNotes SET employee_id = ?, supplier_id = ?, received_date = ? WHERE received_note_id = ?',
            [employee_id, supplier_id, received_date, received_note_id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).send('Received note not found');
        }
        res.status(200).send('Received note updated successfully');
    } catch (error) {
        res.status(500).send('Error updating received note');
    }
};

// Xóa một phiếu nhập theo ID
const deleteReceivedNote = async (req, res) => {
    const { received_note_id } = req.params;
    try {
        const [result] = await connection.query('DELETE FROM ReceivedNotes WHERE received_note_id = ?', [received_note_id]);
        if (result.affectedRows === 0) {
            return res.status(404).send('Received note not found');
        }
        res.status(200).send('Received note deleted successfully');
    } catch (error) {
        res.status(500).send('Error deleting received note');
    }
};

export default {
    getReceivedNotes,
    getReceivedNoteById,
    createReceivedNote,
    updateReceivedNote,
    deleteReceivedNote,
};
