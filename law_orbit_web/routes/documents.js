const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, async (req, res) => {
    try {
        let query = `SELECT d.*, c.title as caseTitle FROM documents d LEFT JOIN cases c ON d.case_id=c.id`;
        let params = [];
        if (req.userRole === 'client') {
            query += ' WHERE d.case_id IN (SELECT id FROM cases WHERE client_id=?)';
            params.push(req.userId);
        } else if (req.userRole === 'lawyer') {
            query += ' WHERE d.case_id IN (SELECT id FROM cases WHERE lawyer_id=?)';
            params.push(req.userId);
        }
        query += ' ORDER BY d.upload_date DESC';
        const [docs] = await db.query(query, params);
        res.json(docs);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/upload', verifyToken, async (req, res) => {
    try {
        const { case_id, name, type, size } = req.body;
        const [result] = await db.query(
            'INSERT INTO documents (case_id,name,type,size,uploaded_by,upload_date,path) VALUES (?,?,?,?,?,CURDATE(),?)',
            [case_id, name, type || 'PDF', size || '0 KB', req.userId, '/uploads/' + name]);
        res.status(201).json({ id: result.insertId, message: 'Document uploaded' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
