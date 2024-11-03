// src/controllers/InvoiceController.js
const pool = require('../config/database.js');

class InvoiceController {
    static async createInvoice(req, res) {
        const { user_id, amount } = req.body;

        try {
            const [result] = await pool.execute(
                'INSERT INTO invoices (user_id, amount) VALUES (?, ?)',
                [user_id, amount]
            );
            res.status(201).json({ id: result.insertId, user_id, amount, status: 'pending' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getInvoices(req, res) {
        const { userId } = req;

        try {
            const [invoices] = await pool.execute('SELECT * FROM invoices WHERE user_id = ?', [userId]);
            res.json(invoices);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateInvoice(req, res) {
        const { id } = req.params;
        const { status } = req.body;

        try {
            const [result] = await pool.execute('UPDATE invoices SET status = ? WHERE id = ?', [status, id]);
            if (result.affectedRows > 0) {
                res.json({ message: 'Invoice updated successfully' });
            } else {
                res.status(404).json({ message: 'Invoice not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = InvoiceController;
