import connection from '../config/database.js';

const getAllReceivedNoteDetails = async (req, res) => {
    try {
        const [rows] = await connection.query('SELECT * FROM ReceivedNoteDetails');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getReceivedNoteDetailById = async (req, res) => {
    try {
        const { received_note_id } = req.params;

        // Truy vấn tất cả các bản ghi cùng received_note_id
        const query = `
            SELECT medicine_id, quantity, price FROM ReceivedNoteDetails
            WHERE received_note_id = ?
        `;
        const [details] = await connection.execute(query, [received_note_id]);

        if (details.length === 0) {
            return res.status(404).json({ message: 'No details found for this received note ID' });
        }

        // Trả về liệt kê của các received_note có cùng received_note_id
        res.json({ received_note_id, details });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createReceivedNoteDetail = async (req, res) => {
    try {
        const { received_note_id, medicine_id, quantity, price } = req.body;
        await connection.query(
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
        const [result] = await connection.query(
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
        const [result] = await connection.query(
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