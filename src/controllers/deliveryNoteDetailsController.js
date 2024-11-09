import connection from '../config/database.js';

const getAllDeliveryNoteDetails = async (req, res) => {
    try {
        const [rows] = await connection.promise().query('SELECT * FROM DeliveryNoteDetails');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDeliveryNoteDetailById = async (req, res) => {
    try {
        const { delivery_note_id } = req.params;

        // Truy vấn tất cả các bản ghi cùng delivery_note_id
        const query = `
            SELECT medicine_id, quantity, price FROM DeliveryNoteDetails
            WHERE delivery_note_id = ?
        `;
        const [details] = await connection.promise().execute(query, [delivery_note_id]);

        if (details.length === 0) {
            return res.status(404).json({ message: 'No details found for this delivery note ID' });
        }

        // Trả về liệt kê của các delivery_note có cùng delivery_note_id
        res.json({ delivery_note_id, details });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createDeliveryNoteDetail = async (req, res) => {
    const { delivery_note_id, medicine_id, quantity, price } = req.body;
    try {
        await connection.promise().query('INSERT INTO DeliveryNoteDetails (delivery_note_id, medicine_id, quantity, price) VALUES (?, ?, ?, ?)', [delivery_note_id, medicine_id, quantity, price]);
        res.status(201).json({ message: 'Delivery Note Detail created' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateDeliveryNoteDetail = async (req, res) => {
    const { id } = req.params;
    const { medicine_id, quantity, price } = req.body;
    try {
        await connection.promise().query('UPDATE DeliveryNoteDetails SET medicine_id = ?, quantity = ?, price = ? WHERE delivery_note_id = ?', [medicine_id, quantity, price, id]);
        res.status(200).json({ message: 'Delivery Note Detail updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteDeliveryNoteDetail = async (req, res) => {
    const { id } = req.params;
    try {
        await connection.promise().query('DELETE FROM DeliveryNoteDetails WHERE delivery_note_id = ?', [id]);
        res.status(200).json({ message: 'Delivery Note Detail deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default {
    getAllDeliveryNoteDetails,
    getDeliveryNoteDetailById,
    createDeliveryNoteDetail,
    updateDeliveryNoteDetail,
    deleteDeliveryNoteDetail,
};
