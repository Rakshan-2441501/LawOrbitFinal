const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, async (req, res) => {
    try {
        let query = `SELECT p.*, i.invoice_number, i.description as invoice_desc, u.name as client_name
            FROM payments p JOIN invoices i ON p.invoice_id=i.id LEFT JOIN users u ON p.client_id=u.id`;
        let params = [];
        if (req.userRole === 'client') { query += ' WHERE p.client_id=?'; params.push(req.userId); }
        else if (req.userRole === 'lawyer') { query += ' WHERE i.lawyer_id=?'; params.push(req.userId); }
        query += ' ORDER BY p.paid_at DESC';
        const [payments] = await db.query(query, params);
        res.json(payments);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', verifyToken, async (req, res) => {
    try {
        const { invoice_id, amount, payment_method } = req.body;
        const txnId = `TXN${Date.now()}`;
        const [result] = await db.query(
            "INSERT INTO payments (invoice_id,client_id,amount,payment_method,transaction_id,status) VALUES (?,?,?,?,?,'Success')",
            [invoice_id, req.userId, amount, payment_method || 'UPI', txnId]);
        await db.query("UPDATE invoices SET status='Paid', paid_date=CURDATE() WHERE id=?", [invoice_id]);
        res.status(201).json({ id: result.insertId, transaction_id: txnId, message: 'Payment successful' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
