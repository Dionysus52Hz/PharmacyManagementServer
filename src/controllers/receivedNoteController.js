// src/controllers/receivedNoteController.js
import connection from '../config/database.js';

// Lấy danh sách tất cả các phiếu nhập
const getReceivedNotes = async (req, res) => {
    try {
        // Start a transaction
        await connection.beginTransaction();

        // Execute the SELECT query
        const [rows] = await connection.query('SELECT * FROM ReceivedNotes');

        // Commit the transaction (even though no changes are made, it finalizes the read operation)
        await connection.commit();

        // Send the result
        res.json(rows);
    } catch (error) {
        // Rollback the transaction if there's an error
        if (connection) await connection.rollback();
        res.status(500).send('Error fetching received notes');
    }
};

// Lấy danh sách phiếu nhập theo Id
const getReceivedNoteById = async (req, res) => {
    const { received_note_id } = req.params;
    try {
        // Start a transaction
        await connection.beginTransaction();

        // Execute the SELECT query within the transaction
        const [rows] = await connection.query('SELECT * FROM ReceivedNotes WHERE received_note_id = ?', [received_note_id]);

        if (rows.length === 0) {
            await connection.rollback(); // Rollback in case of not found to keep transaction clean
            return res.status(404).send('Received note not found');
        }

        // Commit the transaction after a successful fetch
        await connection.commit();

        // Send the result
        res.json(rows[0]);
    } catch (error) {
        // Rollback the transaction if there's an error
        if (connection) await connection.rollback();
        res.status(500).send('Error fetching received note');
    }
};

const createReceivedNote = async (req, res) => {
    const { employee_id, supplier_id, received_date } = req.body;

    try {
        // Gọi PROCDURE để tạo phiếu nhập kho
        const [result] = await connection.query(
            'CALL createReceivedNote(?, ?, ?)',
            [employee_id, supplier_id, received_date]
        );
        res.status(201).json({ message: 'Received note created successfully' });
    } catch (error) {
        res.status(500).send('Error creating received note');
    }
};

// Cập nhật thông tin một phiếu nhập
const updateReceivedNote = async (req, res) => {
    const { received_note_id } = req.params;
    const { employee_id, supplier_id, received_date } = req.body;
    try {
        // Start a transaction
        await connection.beginTransaction();

        // Perform the update operation
        const [result] = await connection.query(
            'UPDATE ReceivedNotes SET employee_id = ?, supplier_id = ?, received_date = ? WHERE received_note_id = ?',
            [employee_id, supplier_id, received_date, received_note_id]
        );

        if (result.affectedRows === 0) {
            // Rollback transaction if no rows were affected
            await connection.rollback();
            return res.status(404).send('Received note not found');
        }

        // Commit the transaction if update is successful
        await connection.commit();
        res.status(200).send('Received note updated successfully');
    } catch (error) {
        // Rollback transaction in case of an error
        if (connection) await connection.rollback();

        res.status(500).send('Error updating received note');
    }
};

// Xóa một phiếu nhập theo ID
const deleteReceivedNote = async (req, res) => {
    const { received_note_id } = req.params;
    try {
        // Start a transaction
        await connection.beginTransaction();

        // Perform the delete operation
        const [result] = await connection.query(
            'DELETE FROM ReceivedNotes WHERE received_note_id = ?',
            [received_note_id]
        );

        if (result.affectedRows === 0) {
            // Rollback transaction if no rows were affected
            await connection.rollback();
            return res.status(404).send('Received note not found');
        }

        // Commit the transaction if delete is successful
        await connection.commit();
        res.status(200).send('Received note deleted successfully');
    } catch (error) {
        // Rollback transaction in case of an error
        if (connection) await connection.rollback();
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
