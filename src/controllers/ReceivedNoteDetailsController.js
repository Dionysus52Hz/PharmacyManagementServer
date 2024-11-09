import connection from '../config/database.js';

const getAllReceivedNoteDetails = async (req, res) => {
    try {
        const [rows] = await connection.promise().query('SELECT * FROM ReceivedNoteDetails');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getReceivedNoteDetailById = async (req, res) => {
    try {
        const { received_note_id, medicine_id } = req.params;
        const [rows] = await connection.promise().query(
            'SELECT * FROM ReceivedNoteDetails WHERE received_note_id = ? AND medicine_id = ?',
            [received_note_id, medicine_id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Chi tiết không tồn tại' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createReceivedNoteDetail = async (req, res) => {
    try {
        const { received_note_id, medicine_id, quantity, price } = req.body;
        await connection.promise().query(
            'INSERT INTO ReceivedNoteDetails (received_note_id, medicine_id, quantity, price) VALUES (?, ?, ?, ?)',
            [received_note_id, medicine_id, quantity, price]
        );
        res.status(201).json({ message: 'Chi tiết nhập kho đã được thêm thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateReceivedNoteDetail = async (req, res) => {
    try {
        const { received_note_id, medicine_id } = req.params;
        const { quantity, price } = req.body;
        const [result] = await connection.promise().query(
            'UPDATE ReceivedNoteDetails SET quantity = ?, price = ? WHERE received_note_id = ? AND medicine_id = ?',
            [quantity, price, received_note_id, medicine_id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Chi tiết không tồn tại' });
        }
        res.status(200).json({ message: 'Chi tiết nhập kho đã được cập nhật' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteReceivedNoteDetail = async (req, res) => {
    try {
        const { received_note_id, medicine_id } = req.params;
        const [result] = await connection.promise().query(
            'DELETE FROM ReceivedNoteDetails WHERE received_note_id = ? AND medicine_id = ?',
            [received_note_id, medicine_id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Chi tiết không tồn tại' });
        }
        res.status(200).json({ message: 'Chi tiết nhập kho đã được xóa' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default {
    getAllReceivedNoteDetails,
    getReceivedNoteDetailById,
    createReceivedNoteDetail,
    updateReceivedNoteDetail,
    deleteReceivedNoteDetail,
};