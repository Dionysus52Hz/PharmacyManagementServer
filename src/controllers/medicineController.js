// src/controllers/medicineController.js
import connection from '../config/database.js';

// Lấy danh sách tất cả các loại thuốc
const getMedicines = async (req, res) => {
    try {
        await connection.promise().beginTransaction(); // Bắt đầu transaction

        const [rows] = await connection.promise().query('SELECT * FROM Medicine');

        await connection.promise().commit(); // Commit transaction khi thành công
        res.json(rows);
    } catch (error) {
        await connection.promise().rollback(); // Rollback transaction khi có lỗi
        res.status(500).send('Error fetching medicines');
    }
};

// Lấy chi tiết một loại thuốc theo ID
const getMedicineById = async (req, res) => {
    const { medicine_id } = req.params;
    try {
        await connection.promise().beginTransaction();

        const [rows] = await connection.promise().query('SELECT * FROM Medicine WHERE medicine_id = ?', [medicine_id]);
        if (rows.length === 0) {
            await connection.promise().rollback();
            return res.status(404).send('Medicine not found');
        }

        await connection.promise().commit();
        res.json(rows[0]);
    } catch (error) {
        await connection.promise().rollback();
        res.status(500).send('Error fetching medicine');
    }
};

// Tạo mới một loại thuốc
const createMedicine = async (req, res) => {
    const { medicine_id, name, manufacturer_id, supplier_id, effects, category_id } = req.body;
    try {
        await connection.promise().beginTransaction();

        const [result] = await connection.promise().query(
            'INSERT INTO Medicine (medicine_id, name, manufacturer_id, supplier_id, effects, category_id) VALUES (?, ?, ?, ?, ?, ?)',
            [medicine_id, name, manufacturer_id, supplier_id, effects, category_id]
        );

        await connection.promise().commit();
        // res.status(201).json({ medicine_id: result.insertId });
        res.status(200).send('Medicine create successfully');

    } catch (error) {
        await connection.promise().rollback();

        res.status(500).send('Error creating medicine');
    }
};

// Cập nhật thông tin một loại thuốc
const updateMedicine = async (req, res) => {
    const { medicine_id } = req.params;
    const { name, manufacturer_id, supplier_id, effects, category_id } = req.body;
    try {
        await connection.promise().beginTransaction();

        const [result] = await connection.promise().query(
            'UPDATE Medicine SET name = ?, manufacturer_id = ?, supplier_id = ?, effects = ?, category_id = ? WHERE medicine_id = ?',
            [name, manufacturer_id, supplier_id, effects, category_id, medicine_id]
        );

        if (result.affectedRows === 0) {
            await connection.promise().rollback();
            return res.status(404).send('Medicine not found');
        }

        await connection.promise().commit();
        res.status(200).send('Medicine updated successfully');
    } catch (error) {
        await connection.promise().rollback();
        console.error('MySQL Error: ', error); // Hiển thị chi tiết lỗi

        res.status(500).send('Error updating medicine');
    }
};

// Xóa một loại thuốc theo ID
const deleteMedicine = async (req, res) => {
    const { medicine_id } = req.params;
    try {
        await connection.promise().beginTransaction();

        const [result] = await connection.promise().query('DELETE FROM Medicine WHERE medicine_id = ?', [medicine_id]);

        if (result.affectedRows === 0) {
            await connection.promise().rollback();
            return res.status(404).send('Medicine not found');
        }

        await connection.promise().commit();
        res.status(200).send('Medicine deleted successfully');
    } catch (error) {
        await connection.promise().rollback();
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
