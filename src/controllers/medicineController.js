// src/controllers/medicineController.js
import connection from '../config/database.js';


// Lấy danh sách tất cả các loại thuốc
const getMedicines = async (req, res) => {
    try {
        const [rows] = await connection.promise().query('SELECT * FROM Medicine');
        res.json(rows);
    } catch (error) {
        res.status(500).send('Error fetching medicines');
    }
};

// Lấy chi tiết một loại thuốc theo ID
const getMedicineById = async (req, res) => {
    const { medicine_id } = req.params;
    try {
        const [rows] = await connection.promise().query('SELECT * FROM Medicine WHERE medicine_id = ?', [medicine_id]);
        if (rows.length === 0) {
            return res.status(404).send('Medicine not found');
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).send('Error fetching medicine');
    }
};

// Tạo mới một loại thuốc
const createMedicine = async (req, res) => {
    const { name, manufacturer_id, supplier_id, effects, category_id } = req.body;
    try {
        const [result] = await connection.promise().query(
            'INSERT INTO Medicine (name, manufacturer_id, supplier_id, effects, category_id) VALUES (?, ?, ?, ?, ?)',
            [name, manufacturer_id, supplier_id, effects, category_id]
        );
        res.status(201).json({ medicine_id: result.insertId });
    } catch (error) {
        res.status(500).send('Error creating medicine');
    }
};

// Cập nhật thông tin một loại thuốc
const updateMedicine = async (req, res) => {
    const { medicine_id } = req.params;
    const { name, manufacturer_id, supplier_id, effects, category_id } = req.body;
    try {
        const [result] = await connection.promise().query(
            'UPDATE Medicine SET name = ?, manufacturer_id = ?, supplier_id = ?, effects = ?, category_id = ? WHERE medicine_id = ?',
            [name, manufacturer_id, supplier_id, effects, category_id, medicine_id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).send('Medicine not found');
        }
        res.status(200).send('Medicine updated successfully');
    } catch (error) {
        res.status(500).send('Error updating medicine');
    }
};

// Xóa một loại thuốc theo ID
const deleteMedicine = async (req, res) => {
    const { medicine_id } = req.params;
    try {
        const [result] = await connection.promise().query('DELETE FROM Medicine WHERE medicine_id = ?', [medicine_id]);
        if (result.affectedRows === 0) {
            return res.status(404).send('Medicine not found');
        }
        res.status(200).send('Medicine deleted successfully');
    } catch (error) {
        res.status(500).send('Error deleting medicine');
    }
};

export default {
    getMedicines,
    getMedicineById,
    createMedicine,
    updateMedicine,
    deleteMedicine,
};
