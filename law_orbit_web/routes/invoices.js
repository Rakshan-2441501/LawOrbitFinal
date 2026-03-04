const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, async (req, res) => {
    try {
        let query = `SELECT i.*, u1.name as lawyer_name, u2.name as client_name, c.title as case_title 
            FROM invoices i LEFT JOIN users u1 ON i.lawyer_id=u1.id LEFT JOIN users u2 ON i.client_id=u2.id 
            LEFT JOIN cases c ON i.case_id=c.id`;
        let params = [];
        if (req.userRole === 'lawyer') { query += ' WHERE i.lawyer_id=?'; params.push(req.userId); }
        else if (req.userRole === 'client') { query += ' WHERE i.client_id=?'; params.push(req.userId); }
        query += ' ORDER BY i.created_at DESC';
        const [invoices] = await db.query(query, params);
        res.json(invoices);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', verifyToken, async (req, res) => {
    try {
        const { case_id, client_id, amount, description, due_date } = req.body;
        const tax = amount * 0.18;
        const total = amount + tax;
        const num = `INV-${Date.now()}`;
        const [result] = await db.query(
            'INSERT INTO invoices (invoice_number,case_id,lawyer_id,client_id,amount,tax_amount,total_amount,status,due_date,description) VALUES (?,?,?,?,?,?,?,?,?,?)',
            [num, case_id, req.userId, client_id, amount, tax, total, 'Sent', due_date, description]);
        res.status(201).json({ id: result.insertId, invoice_number: num, message: 'Invoice created' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
