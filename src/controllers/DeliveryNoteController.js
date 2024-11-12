// src/controllers/deliveryNoteController.js
import connection from '../config/database.js';

const getDeliveryNotes = async (req, res) => {
    try {
        // Start the transaction
        await connection.beginTransaction();

        // Query to fetch delivery notes
        const [rows] = await connection.query('SELECT * FROM DeliveryNotes');

        // Commit the transaction
        await connection.commit();

        // Send response with the fetched data
        res.json(rows);
    } catch (error) {
        // Rollback the transaction in case of an error
        if (connection) await connection.rollback();
        res.status(500).send('Error fetching delivery notes');
    }
};

const getDeliveryNoteById = async (req, res) => {
    const { delivery_note_id } = req.params;
    try {
        // Start the transaction
        await connection.beginTransaction();
        // Query to fetch the delivery note by ID
        const [rows] = await connection.query('SELECT * FROM DeliveryNotes WHERE delivery_note_id = ?', [delivery_note_id]);

        // Commit the transaction
        await connection.commit();

        // Check if any delivery note was found
        if (rows.length === 0) {
            return res.status(404).send('Delivery note not found');
        }

        // Send response with the found delivery note
        res.json(rows[0]);
    } catch (error) {
        // Rollback the transaction in case of an error
        if (connection) await connection.rollback();
        res.status(500).send('Error fetching delivery note');
    }
};

const createDeliveryNote = async (req, res) => {
    const { employee_id, customer_id, delivery_date } = req.body;

    try {
        const [result] = await connection.query('CALL CreateDeliveryNote(?, ?, ?, @out_delivery_note_id)', [
            employee_id,
            customer_id,
            delivery_date,
        ]);

        res.status(200).send('deliveryNote create successfully');
    } catch (error) {
        res.status(500).json({ message: 'Error creating delivery note' });
    }
};

const deleteDeliveryNote = async (req, res) => {
    const { delivery_note_id } = req.params;
    try {
        // Start the transaction
        await connection.beginTransaction();

        // Delete the delivery note
        const [result] = await connection.query('DELETE FROM DeliveryNotes WHERE delivery_note_id = ?', [delivery_note_id]);

        if (result.affectedRows === 0) {
            // Rollback the transaction if no rows were affected
            await connection.rollback();
            return res.status(404).send('Delivery note not found');
        }

        // Commit the transaction
        await connection.commit();

        res.status(200).send('Delivery note deleted');
    } catch (error) {
        // Rollback the transaction in case of any error
        if (connection) await connection.rollback();
        res.status(500).send('Error deleting delivery note');
    }
};

export default {
    getDeliveryNotes,
    getDeliveryNoteById,
    createDeliveryNote,
    deleteDeliveryNote,
};
